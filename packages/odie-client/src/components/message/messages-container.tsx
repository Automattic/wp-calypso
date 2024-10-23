import { forwardRef } from 'react';
import { ThumbsDown } from '../../assets/thumbs-down';
import { useOdieAssistantContext } from '../../context';
import { useZendeskMessageListener } from '../../utils';
import { DislikeFeedbackMessage } from './dislike-feedback-message';
import { ThinkingPlaceholder } from './thinking-placeholder';
import ChatMessage from '.';
import type { CurrentUser } from '../../types/';

interface ChatMessagesProps {
	currentUser: CurrentUser;
}
const DislikeThumb = () => {
	return (
		<div className="chatbox-message__dislike-thumb">
			<ThumbsDown />
		</div>
	);
};

export const MessagesContainer = forwardRef< HTMLDivElement, ChatMessagesProps >(
	( { currentUser }, ref ) => {
		const { chat, chatStatus } = useOdieAssistantContext();
		useZendeskMessageListener();

		let lastUserMessageIndex = -1;
		let lastFeedbackMessageIndex = -1;
		let lastErrorMessageIndex = -1;

		chat.messages.forEach( ( message, index ) => {
			if ( message.role === 'user' ) {
				lastUserMessageIndex = index;
			}
			if ( message.type === 'dislike-feedback' ) {
				lastFeedbackMessageIndex = index;
			}
			if ( message.type === 'error' ) {
				lastErrorMessageIndex = index;
			}
		} );

		const lastMessageIndex = chat.messages.length - 1;

		return (
			<div className="chatbox-messages" ref={ ref }>
				{ chat.messages.map( ( message, index ) => (
					<ChatMessage
						message={ message }
						key={ index }
						currentUser={ currentUser }
						isLastUserMessage={ lastUserMessageIndex === index }
						isLastFeedbackMessage={ lastFeedbackMessageIndex === index }
						isLastErrorMessage={ lastErrorMessageIndex === index }
						isLastMessage={ lastMessageIndex === index }
					/>
				) ) }
				{ chatStatus === 'dislike' && <DislikeThumb /> }
				<div className="odie-chatbox__action-message">
					{ chatStatus === 'sending' && lastUserMessageIndex === lastMessageIndex && (
						<ThinkingPlaceholder />
					) }
					{ chatStatus === 'dislike' && <DislikeFeedbackMessage /> }
				</div>
			</div>
		);
	}
);
