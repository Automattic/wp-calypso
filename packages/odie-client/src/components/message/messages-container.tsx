import { useResetSupportInteraction } from '@automattic/help-center/src/hooks/use-reset-support-interaction';
import { getShortDateString } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { useEffect, useRef, useState } from 'react';
import { NavigationType, useNavigationType, useSearchParams } from 'react-router-dom';
import { ThumbsDown } from '../../assets/thumbs-down';
import { useOdieAssistantContext } from '../../context';
import {
	useAutoScroll,
	useCreateZendeskConversation,
	useZendeskMessageListener,
	useUpdateDocumentTitle,
} from '../../hooks';
import { useHelpCenterChatScroll } from '../../hooks/use-help-center-chat-scroll';
import { getOdieInitialMessage } from '../../utils';
import { ViewMostRecentOpenConversationNotice } from '../odie-notice/view-most-recent-conversation-notice';
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
	const { chat, botNameSlug, experimentVariationName, isChatLoaded, isUserEligibleForPaidSupport } =
		useOdieAssistantContext();
	const createZendeskConversation = useCreateZendeskConversation();
	const resetSupportInteraction = useResetSupportInteraction();
	const [ searchParams, setSearchParams ] = useSearchParams();
	const isForwardingToZendesk =
		searchParams.get( 'provider' ) === 'zendesk' && chat.provider !== 'zendesk';
	const [ hasForwardedToZendesk, setHasForwardedToZendesk ] = useState( false );
	const [ chatMessagesLoaded, setChatMessagesLoaded ] = useState( false );
	const [ shouldEnableAutoScroll, setShouldEnableAutoScroll ] = useState( true );
	const navType: NavigationType = useNavigationType();

	const messagesContainerRef = useRef< HTMLDivElement >( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );

	useZendeskMessageListener();
	useAutoScroll( messagesContainerRef, shouldEnableAutoScroll );
	useHelpCenterChatScroll( chat?.supportInteractionId, scrollParentRef, ! shouldEnableAutoScroll );

	useEffect( () => {
		if ( navType === 'POP' && ( isChatLoaded || ! isUserEligibleForPaidSupport ) ) {
			setShouldEnableAutoScroll( false );
		}
	}, [ navType, isUserEligibleForPaidSupport, shouldEnableAutoScroll, isChatLoaded ] );

	useEffect( () => {
		if ( messagesContainerRef.current && scrollParentRef.current === null ) {
			scrollParentRef.current = messagesContainerRef.current?.closest(
				'.help-center__container-content'
			);
		}
	}, [ messagesContainerRef ] );
	useUpdateDocumentTitle();

	useEffect( () => {
		if ( isForwardingToZendesk || hasForwardedToZendesk ) {
			return;
		}

		( chat?.status === 'loaded' || chat?.status === 'closed' ) && setChatMessagesLoaded( true );
	}, [ chat, isForwardingToZendesk, hasForwardedToZendesk ] );

	/**
	 * Handle the case where we are forwarding to Zendesk.
	 */
	useEffect( () => {
		if (
			isForwardingToZendesk &&
			! hasForwardedToZendesk &&
			! chat.conversationId &&
			createZendeskConversation &&
			resetSupportInteraction &&
			isChatLoaded
		) {
			searchParams.delete( 'provider' );
			searchParams.set( 'direct-zd-chat', '1' );
			setSearchParams( searchParams );
			setHasForwardedToZendesk( true );

			resetSupportInteraction().then( ( interaction ) => {
				if ( isChatLoaded ) {
					createZendeskConversation( {
						avoidTransfer: true,
						interactionId: interaction?.uuid,
						createdFrom: 'direct_url',
					} ).then( () => {
						setChatMessagesLoaded( true );
					} );
				}
			} );
		}
	}, [
		isForwardingToZendesk,
		hasForwardedToZendesk,
		isChatLoaded,
		chat?.conversationId,
		resetSupportInteraction,
		createZendeskConversation,
	] );

	// Used to apply the correct styling on messages
	const isNextMessageFromSameSender = ( currentMessage: string, nextMessage: string ) => {
		return currentMessage === nextMessage;
	};

	const removeDislikeStatus = experimentVariationName === 'give_wapuu_a_chance';

	const availableStatusWithFeedback = removeDislikeStatus
		? [ 'sending', 'transfer' ]
		: [ 'sending', 'dislike', 'transfer' ];

	return (
		<>
			<div className="chatbox-messages" ref={ messagesContainerRef }>
				<ChatDate chat={ chat } />
				{ ! chatMessagesLoaded ? (
					<LoadingChatSpinner />
				) : (
					<>
						{ ( chat.odieId || chat.provider === 'odie' ) && (
							<ChatMessage
								message={ getOdieInitialMessage( botNameSlug ) }
								key={ 0 }
								currentUser={ currentUser }
								isNextMessageFromSameSender={ false }
								displayChatWithSupportLabel={ false }
							/>
						) }
						{ chat.messages.map( ( message, index ) => {
							const nextMessage = chat.messages[ index + 1 ];
							const displayChatWithSupportLabel =
								! nextMessage?.context?.flags?.show_contact_support_msg &&
								message.context?.flags?.show_contact_support_msg;

							return (
								<ChatMessage
									message={ message }
									key={ index }
									currentUser={ currentUser }
									isNextMessageFromSameSender={ isNextMessageFromSameSender(
										message.role,
										chat.messages[ index + 1 ]?.role
									) }
									displayChatWithSupportLabel={ displayChatWithSupportLabel }
								/>
							);
						} ) }
						<JumpToRecent containerReference={ messagesContainerRef } />
						{ chat.provider === 'odie' && <ViewMostRecentOpenConversationNotice /> }
						{ chat.status === 'dislike' && ! removeDislikeStatus && <DislikeThumb /> }
						{ availableStatusWithFeedback.includes( chat.status ) && (
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
