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
		const { chat, chatStatus, shouldUseHelpCenterExperience } = useOdieAssistantContext();
		useZendeskMessageListener();

		let lastUserMessageIndex = -1;
		let lastFeedbackMessageIndex = -1;
		let lastErrorMessageIndex = -1;
		let firstBusinessMessageIndex = -1;

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
			// Find the first business message
			// this will be used to notify users that they are talking with a human.
			if ( firstBusinessMessageIndex === -1 && message.role === 'business' ) {
				firstBusinessMessageIndex = index + 1;
			}
		} );

		const lastMessageIndex = chat.messages.length - 1;

		// Used to apply the correct styling on messages
		const isNextMessageFromSameSender = ( currentMessage: string, nextMessage: string ) => {
			return currentMessage === nextMessage;
		};

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
						isNextMessageFromSameSender={ isNextMessageFromSameSender(
							message.role,
							chat.messages[ index + 1 ]?.role
						) }
						displayChatWithSupportLabel={ firstBusinessMessageIndex === index }
					/>
				) ) }
				{ chatStatus === 'dislike' && shouldUseHelpCenterExperience && <DislikeThumb /> }
				<div className="odie-chatbox__action-message">
					{ chatStatus === 'sending' && <ThinkingPlaceholder /> }
					{ chatStatus === 'dislike' && <DislikeFeedbackMessage /> }
				</div>
			</div>
		);
	}
);
