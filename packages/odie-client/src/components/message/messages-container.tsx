import { HelpCenterSelect } from '@automattic/data-stores';
import { useResetSupportInteraction } from '@automattic/help-center/src/hooks/use-reset-support-interaction';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import clx from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { NavigationType, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { getOdieInitialMessage } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import {
	useAutoScroll,
	useCreateZendeskConversation,
	useZendeskMessageListener,
	useUpdateDocumentTitle,
} from '../../hooks';
import { useHelpCenterChatScroll } from '../../hooks/use-help-center-chat-scroll';
import getMostRecentOpenLiveInteraction from '../notices/get-most-recent-open-live-interaction';
import { JumpToRecent } from './jump-to-recent';
import { MessagesClusterizer } from './messages-cluster/messages-cluster';
import { ThinkingPlaceholder } from './thinking-placeholder';
import { TypingPlaceholder } from './typing-placeholder';
import ChatMessage from '.';
import type { CurrentUser } from '../../types';
interface ChatMessagesProps {
	currentUser: CurrentUser;
}

export const MessagesContainer = ( { currentUser }: ChatMessagesProps ) => {
	const { chat, botNameSlug, isChatLoaded, isUserEligibleForPaidSupport, forceEmailSupport } =
		useOdieAssistantContext();
	const createZendeskConversation = useCreateZendeskConversation();
	const { resetSupportInteraction } = useResetSupportInteraction();
	const [ searchParams, setSearchParams ] = useSearchParams();
	const navigate = useNavigate();
	const isForwardingToZendesk =
		searchParams.get( 'provider' ) === 'zendesk' && chat.provider !== 'zendesk';
	const [ hasForwardedToZendesk, setHasForwardedToZendesk ] = useState( false );
	const [ chatMessagesLoaded, setChatMessagesLoaded ] = useState( false );
	const [ shouldEnableAutoScroll, setShouldEnableAutoScroll ] = useState( true );
	const navType: NavigationType = useNavigationType();
	const typingStatus = useSelect(
		( select ) =>
			( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getSupportTypingStatus(
				chat.conversationId ?? ''
			),
		[ chat.conversationId ]
	);

	const messagesContainerRef = useRef< HTMLDivElement >( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );

	const alreadyHasActiveZendeskChatId = getMostRecentOpenLiveInteraction();

	useZendeskMessageListener();
	const isScrolling = useAutoScroll( messagesContainerRef, shouldEnableAutoScroll );
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

	// prevent zd transfer for non-eligible users
	useEffect( () => {
		if ( isForwardingToZendesk && ! isUserEligibleForPaidSupport ) {
			searchParams.delete( 'provider' );
			setChatMessagesLoaded( true );
		}
	}, [ isForwardingToZendesk, isUserEligibleForPaidSupport, setChatMessagesLoaded, searchParams ] );

	useEffect( () => {
		if ( isForwardingToZendesk || hasForwardedToZendesk ) {
			return;
		}

		( chat?.status === 'loaded' || chat?.status === 'closed' ) && setChatMessagesLoaded( true );
	}, [ chat?.status, isForwardingToZendesk, hasForwardedToZendesk ] );

	/**
	 * Handle the case where we are forwarding to Zendesk.
	 */
	useEffect( () => {
		if (
			isForwardingToZendesk &&
			! hasForwardedToZendesk &&
			! chat.conversationId &&
			isChatLoaded &&
			! forceEmailSupport
		) {
			searchParams.delete( 'provider' );
			searchParams.set( 'direct-zd-chat', '1' );
			setSearchParams( searchParams );
			setHasForwardedToZendesk( true );

			// when forwarding to zd avoid creating new chats
			if (
				alreadyHasActiveZendeskChatId &&
				alreadyHasActiveZendeskChatId !== chat.supportInteractionId
			) {
				setChatMessagesLoaded( true );
				// Redirect to the existing Zendesk chat.
				searchParams.set( 'id', alreadyHasActiveZendeskChatId );
				return navigate( '/odie?' + searchParams.toString() );
			}
			resetSupportInteraction().then( ( interaction ) => {
				createZendeskConversation( {
					avoidTransfer: true,
					interactionId: interaction?.uuid,
					createdFrom: 'direct_url',
				} ).then( () => {
					setChatMessagesLoaded( true );
				} );
			} );
		}
	}, [
		chat.supportInteractionId,
		navigate,
		isForwardingToZendesk,
		hasForwardedToZendesk,
		isChatLoaded,
		chat?.conversationId,
		resetSupportInteraction,
		createZendeskConversation,
		alreadyHasActiveZendeskChatId,
		forceEmailSupport,
		searchParams,
		setSearchParams,
	] );

	return (
		<div
			className={ clx( 'chatbox-messages', {
				'force-email-support': forceEmailSupport && chat.provider === 'zendesk',
			} ) }
			ref={ messagesContainerRef }
		>
			<div
				className="screen-reader-text"
				aria-live="polite"
				aria-atomic="false"
				aria-relevant="additions"
			>
				{ chat.messages.map( ( message, index ) => (
					<div key={ index }>
						{ [ 'bot', 'business' ].includes( message.role ) && message.content }
					</div>
				) ) }
			</div>
			<>
				<div
					className={ clx( 'chatbox-loading-chat__spinner', {
						'is-visible': ! chatMessagesLoaded || isScrolling,
					} ) }
				>
					<Spinner />
				</div>
				{ ( chat.odieId || chat.provider === 'odie' ) && (
					<ChatMessage
						message={ getOdieInitialMessage( botNameSlug ) }
						key={ 0 }
						currentUser={ currentUser }
						displayChatWithSupportLabel={ false }
					/>
				) }
				<MessagesClusterizer messages={ chat.messages } />
				<JumpToRecent containerReference={ messagesContainerRef } />

				{ chat.provider === 'odie' && chat.status === 'sending' && (
					<div
						className="odie-chatbox__action-message"
						ref={ ( div ) => div?.scrollIntoView( { behavior: 'smooth', block: 'end' } ) }
					>
						<ThinkingPlaceholder />
					</div>
				) }
				{ chat.provider.startsWith( 'zendesk' ) && typingStatus && (
					<div
						className="odie-chatbox__action-message"
						ref={ ( div ) => div?.scrollIntoView( { behavior: 'smooth', block: 'end' } ) }
					>
						<TypingPlaceholder />
					</div>
				) }
			</>
		</div>
	);
};
