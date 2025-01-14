import { getShortDateString } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { useEffect, useRef, useState } from 'react';
import { ThumbsDown } from '../../assets/thumbs-down';
import { useOdieAssistantContext } from '../../context';
import { useAutoScroll, useZendeskMessageListener } from '../../hooks';
import { getOdieInitialMessage } from '../../utils';
import { DislikeFeedbackMessage } from './dislike-feedback-message';
import { JumpToRecent } from './jump-to-recent';
import { ThinkingPlaceholder } from './thinking-placeholder';
import ChatMessage from '.';
import type { Chat, CurrentUser } from '../../types';

const DislikeThumb = () => {
	return (
		<div className="chatbox-message__dislike-thumb">
			<ThumbsDown />
		</div>
	);
};
const LoadingChatSpinner = () => {
	return (
		<div className="chatbox-loading-chat__spinner">
			<Spinner />
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
	const { chat, botNameSlug } = useOdieAssistantContext();
	const [ chatMessagesLoaded, setChatLoaded ] = useState( false );
	const messagesContainerRef = useRef< HTMLDivElement >( null );
	useZendeskMessageListener();
	useAutoScroll( messagesContainerRef );
	useEffect( () => {
		( chat?.status === 'loaded' || chat?.status === 'closed' ) && setChatLoaded( true );
	}, [ chat ] );

	// Used to apply the correct styling on messages
	const isNextMessageFromSameSender = ( currentMessage: string, nextMessage: string ) => {
		return currentMessage === nextMessage;
	};

	return (
		<>
			<div className="chatbox-messages" ref={ messagesContainerRef }>
				<ChatDate chat={ chat } />
				{ ! chatMessagesLoaded ? (
					<LoadingChatSpinner />
				) : (
					<>
						<ChatMessage
							message={ getOdieInitialMessage( botNameSlug ) }
							key={ 0 }
							currentUser={ currentUser }
							isNextMessageFromSameSender={ false }
							displayChatWithSupportLabel={ false }
						/>
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
						{ chat.status === 'dislike' && <DislikeThumb /> }
						{ [ 'sending', 'dislike', 'transfer' ].includes( chat.status ) && (
							<div className="odie-chatbox__action-message">
								{ chat.status === 'sending' && <ThinkingPlaceholder /> }
								{ chat.status === 'dislike' && <DislikeFeedbackMessage /> }
							</div>
						) }
					</>
				) }
			</div>
		</>
	);
};
