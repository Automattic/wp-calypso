interface FeedbackMessageProps {
	content?: string;
}

export const FeedbackMessage = ( { content }: FeedbackMessageProps ) => {
	return (
		<div className="odie-introduction-message-content odie-introduction-message-content__conversation_feedback">
			<p>{ content }</p>
		</div>
	);
};
