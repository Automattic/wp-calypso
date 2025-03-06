import './style.scss';

const ChatWithSupportLabel = ( { labelText }: { labelText: string } ) => {
	return (
		<div className="chat-with-support-wrapper">
			<div className="chat-with-support__line"></div>
			<div className="chat-with-support__message">{ labelText }</div>
			<div className="chat-with-support__line"></div>
		</div>
	);
};

export default ChatWithSupportLabel;
