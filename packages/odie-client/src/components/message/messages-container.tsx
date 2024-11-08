import { getShortDateString } from '@automattic/i18n-utils';
import { useRef } from 'react';
import { ThumbsDown } from '../../assets/thumbs-down';
import { useOdieAssistantContext } from '../../context';
import useAutoScroll from '../../useAutoScroll';
import { useZendeskMessageListener } from '../../utils';
import { DislikeFeedbackMessage } from './dislike-feedback-message';
import { JumpToRecent } from './jump-to-recent';
import { ThinkingPlaceholder } from './thinking-placeholder';
import ChatMessage from '.';
import type { Chat, CurrentUser } from '../../types/';

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
interface ChatMessagesProps {
	currentUser: CurrentUser;
}

export const MessagesContainer = ( { currentUser }: ChatMessagesProps ) => {
	const { chat, chatStatus, shouldUseHelpCenterExperience } = useOdieAssistantContext();
	const messagesContainerRef = useRef< HTMLDivElement >( null );
	useZendeskMessageListener();
	useAutoScroll( messagesContainerRef );

	// Used to apply the correct styling on messages
	const isNextMessageFromSameSender = ( currentMessage: string, nextMessage: string ) => {
		return currentMessage === nextMessage;
	};

	return (
		<>
			<div className="chatbox-messages" ref={ messagesContainerRef }>
				{ shouldUseHelpCenterExperience && <ChatDate chat={ chat } /> }
				{ chat.messages.map( ( message, index ) => (
					<ChatMessage
						message={ message }
						key={ index }
						currentUser={ currentUser }
						isNextMessageFromSameSender={ isNextMessageFromSameSender(
							message.role,
							chat.messages[ index + 1 ]?.role
						) }
						displayChatWithSupportLabel={ message.context?.flags?.show_contact_support_msg }
					/>
				) ) }
				<JumpToRecent containerReference={ messagesContainerRef } />
				{ chatStatus === 'dislike' && shouldUseHelpCenterExperience && <DislikeThumb /> }
				{ [ 'sending', 'dislike' ].includes( chatStatus ) && (
					<div className="odie-chatbox__action-message">
						{ chatStatus === 'sending' && <ThinkingPlaceholder /> }
						{ chatStatus === 'dislike' && <DislikeFeedbackMessage /> }
					</div>
				) }
			</div>
		</>
	);
};
