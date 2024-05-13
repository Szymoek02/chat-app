import { useState } from "react";
import './message.css'

export default function Chat(props)
{
    const outgoing = (element) => {
        return element.from == props.user.id
    }

    const groupMessages = (inputArray) => {
        return inputArray.reduce((result, currentElement, index, array) => {
            if (index === 0 || 
                (currentElement.to == props.user.id && outgoing(array[index - 1])) || 
                (currentElement.from == props.user.id && !outgoing(array[index - 1])))
                result.push([currentElement])
            else
                result[result.length - 1].push(currentElement);
            
            return result
        }, [])
    }

    const[editorContent, setEditorContent] = useState('')

    return (
        <div className="w-4/5 h-full flex flex-col justify-between">
            <div className="w-full bg-neutral-900 h-16">

            </div>
            <div className="h-full bg-neutral-800 overflow-x-auto">
            {groupMessages(props.messages).map((msGroup, index) => {
                if(msGroup[0].from != props.user.id)
                {
                    return <ul key={index} className="group-custom-received list-none flex flex-col items-start text-slate-300 mx-2 my-1">{
                        msGroup.map(ms => {
                            return <li key={ms.id} className="bg-neutral-600 max-w-fit p-1 px-2 my-px text-sm">{ms.text}</li>
                    })}</ul>
                }
                else
                {
                    return <ul key={index} className="group-custom-send list-none flex flex-col items-end text-slate-300 mx-2 my-1">{
                        msGroup.map(ms => {
                            return <li key={ms.id} className="bg-neutral-600 max-w-fit p-1 px-2 my-px text-sm">{ms.text}</li>
                    })}</ul>
                }                
            })}
            </div>
            <div className="w-full bg-neutral-900 h-fit max-h-40 flex gap-x-2">
                <div><button className="h-7 w-7 bg-blue-500 my-2 rounded-full"></button></div>
                <div><button className="h-7 w-7 bg-blue-500 my-2 rounded-full"></button></div>
                <div><button className="h-7 w-7 bg-blue-500 my-2 rounded-full"></button></div>
                <div><button className="h-7 w-7 bg-blue-500 my-2 rounded-full"></button></div>
                <div className="w-full">
                    <input type="text" className="leading-7 rounded-xl outline-none bg-neutral-600 my-2 h-7 w-full text-sm px-3" placeholder="Send Message..." onChange={t => {
                        setEditorContent(t.target.value)
                        console.log(t.target.value)
                    }}/>
                </div>
                <div><button className="h-7 px-3 text-sm bg-blue-500 my-2 rounded-full">Send</button></div>
            </div>
        </div>
    )
}