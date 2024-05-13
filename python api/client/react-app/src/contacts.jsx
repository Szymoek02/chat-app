export default function Contacts(props)
{
	return (
	  <div className='flex flex-col w-1/5'>
			<div className='bg-neutral-900 h-16'>Hello, {props.hello}</div>

			<div className="bg-neutral-900 h-full">
				<ul>
					{
						(props.data).map((c) => {
							return <li key={c.contact_id} onClick={() => {props.select(c.contact_id)}}><div className="h-16 rounded-lg m-2 p-2 border border-neutral-600 cursor-pointer">
								<p className="text-slate-100 text-base">{c.first_name} {c.second_name}</p>
								<p className="text-slate-400 text-xs">{c.last_message} {c.last_message_status}</p>
							</div></li>
						})
					}
				</ul>
			</div>
		</div>
	)
}