import { getShortDateString } from '@automattic/i18n-utils';
import { forwardRef } from 'react';
import { ThumbsDown } from '../../assets/thumbs-down';
import { useOdieAssistantContext } from '../../context';
import { useZendeskMessageListener } from '../../utils';
import { DislikeFeedbackMessage } from './dislike-feedback-message';
import { ThinkingPlaceholder } from './thinking-placeholder';
import ChatMessage from '.';
import type { Chat, CurrentUser } from '../../types/';

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

const ChatDate = ( { chat }: { chat: Chat } ) => {
	// chat.messages[ 1 ] contains the first user interaction, therefore the date, otherwise the current date.
	const chatDate =
		chat.messages.length > 1 ? chat.messages[ 1 ]?.created_at || Date.now() : Date.now();
	const currentDate = getShortDateString( chatDate as number );
	return <div className="odie-chat__date">{ currentDate }</div>;
};

export const MessagesContainer = forwardRef< HTMLDivElement, ChatMessagesProps >(
	( { currentUser }, ref ) => {
		const { chat, chatStatus, shouldUseHelpCenterExperience } = useOdieAssistantContext();
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

		// Used to apply the correct styling on messages
		const isNextMessageFromSameSender = ( currentMessage: string, nextMessage: string ) => {
			return currentMessage === nextMessage;
		};
		return (
			<div className="chatbox-messages" ref={ ref }>
				{ shouldUseHelpCenterExperience && <ChatDate chat={ chat } /> }
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
						displayChatWithSupportLabel={ message.context?.flags?.show_contact_support_msg }
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
