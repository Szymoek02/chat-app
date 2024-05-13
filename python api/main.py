import mysql
import mysql.connector
import asyncio
import websockets
import json
from datetime import datetime

cursor = db = server = None
thrusted = {1: ["0123456789abcdef"]}

async def query_db(query):
    cursor.execute(query)
    rows = cursor.fetchall()
    return rows

async def handle_request(request):
    request = json.loads(request)
    user_id = request['userID']
    if request['session_key'] in thrusted[user_id]:
    #if True:
        # access granted
        response = {}
        
        # user information
        if request['type'] == 'LOAD_USER_INFO':
            response['user_info'] = await query_db(f'select * from users where ID = {user_id} limit 1;')
            response['user_info'][0]['joining_date'] = response['user_info'][0]['joining_date'].strftime("%Y-%m-%d %H:%M:%S")
            response['type'] = 'USER_INFO_RESPONSE'

        # user contacts
        elif request['type'] == 'LOAD_USER_CONTACTS':
            response['user_contacts'] = await query_db(f'with cte as (select * from messages order by send_datetime desc) \
                                                        select user, chats.id as contact_id, username, first_name, second_name, \
                                                        (select text from cte where chat = chats.id limit 1) as last_message, \
                                                        (select status from cte where chat = chats.id limit 1) as last_message_status, \
                                                        (select send_datetime from cte where chat = chats.id limit 1) as last_message_time \
                                                        from( \
                                                            select id, user1 as user, user2 as friend from contacts \
                                                            union all \
                                                            select id, user2 as user, user1 as friend from contacts \
                                                        ) as chats \
                                                        inner join users on users.id = friend where user = {user_id};')
            for chat in response['user_contacts']:
                chat['last_message_time'] = chat['last_message_time'].strftime("%Y-%m-%d %H:%M:%S")
            response['type'] = 'USER_CONTACTS_RESPONSE'
        
        # specifi chat
        elif request['type'] == 'LOAD_CHAT':
            chat_id = request['chatID']
            response['chat_content'] = await query_db(f'select id, `from`, `to`, `text`, send_datetime, status from messages where chat = {chat_id} order by send_datetime asc limit 30;')
            response['type'] = 'LOAD_CHAT_RESPONSE'
            for message in response['chat_content']:
                message['send_datetime'] = message['send_datetime'].strftime("%Y-%m-%d %H:%M:%S")
        
        # send message
        elif request['type'] == 'SEND_MESSAGE':
            from_id = request['from']
            to_id = request['from']
            content = request['content']
            # utc
            send_datetime = request['send_datetime']
            chat = request['chat']
            cursor.execute(f'insert into messages values (NULL, {from_id}, {to_id}, {content}, {send_datetime}, send, {chat})')

        return json.dumps(response)   
    else:
        return json.dumps("{type: CONTROL, info: ACCESS_DENIED}")


async def handle_connection(websocket, path):
    try:
        async for message in websocket:
            response = await handle_request(message)
            await websocket.send(response)

    except websockets.exceptions.ConnectionClosedOK:
        print("Connection closed normally.")
    except Exception as e:
        print("An error occurred:", e)

async def start():
    global server
    server = await websockets.serve(handle_connection, "localhost", 8000)

    global db
    db = mysql.connector.connect(host="127.0.0.1", user="root", password="password", database="chat_app")
    
    global cursor
    cursor = db.cursor(buffered=True, dictionary=True)
    print("Server started")

async def stop():
    if server:
        server.close()
        await server.wait_closed()
        print("Server stopped")

async def main():
    print('Run')
    await start()

    try:
        await asyncio.Future()
    except KeyboardInterrupt:
        print("Shutting down...")
        await stop()
    

asyncio.run(main())