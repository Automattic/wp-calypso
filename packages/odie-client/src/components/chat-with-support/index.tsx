import './style.scss';

const ChatWithSupportLabel = ( { title = '' } ) => {
	return (
		<div className="chat-with-support-wrapper">
			<div className="chat-with-support__line"></div>
			<div className="chat-with-support__message">{ title }</div>
			<div className="chat-with-support__line"></div>
		</div>
	);
};

export default ChatWithSupportLabel;
