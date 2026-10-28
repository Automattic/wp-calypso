import { useHasEnTranslation } from '@automattic/i18n-utils';
import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { NavigationType, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import {
	getConversationLimitReachedMessage,
	getOdieEmailFallbackMessage,
	getOdieInitialMessage,
	getOdieZendeskConnectionErrorMessage,
	ODIE_DEFAULT_BOT_SLUG_LEGACY,
} from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useCurrentSupportInteraction } from '../../data/use-current-support-interaction';
import {
	useAutoScroll,
	useCreateZendeskConversation,
	useRequestHumanSupport,
	useZendeskMessageListener,
	useUpdateDocumentTitle,
} from '../../hooks';
import { useHelpCenterChatScroll } from '../../hooks/use-help-center-chat-scroll';
import { useLoggedOutSession } from '../../hooks/use-logged-out-session';
import { useOpenInteractionStatusMap } from '../../hooks/use-open-interaction-status-map';
import { getOpenLiveInteractions } from '../../utils/get-open-live-interactions';
import { NO_HUMAN_SUPPORT_FLAGS } from '../../utils/human-support-flags';
import { getOdieIdFromInteraction } from '../../utils/support-interaction-utils';
import { JumpToRecent } from './jump-to-recent';
import { MessagesClusterizer } from './messages-cluster/messages-cluster';
import { ThinkingPlaceholder } from './thinking-placeholder';
import { getMessageUniqueIdentifier } from './utils/get-message-unique-identifier';
import { ZendeskTypingIndicator } from './zendesk-typing-indicator';
import ChatMessage from '.';
import type { CurrentUser, Message } from '../../types';
interface ChatMessagesProps {
	currentUser: CurrentUser;
}

// How long going straight to a human waits for the chat client before giving up.
export const CHAT_CLIENT_TIMEOUT_MS = 15000;

export const MessagesContainer = ( { currentUser }: ChatMessagesProps ) => {
	const {
		chat,
		addMessage,
		trackEvent,
		isChatLoaded,
		isUserEligibleForPaidSupport,
		forceEmailSupport,
		launcherContext,
		isLoadingZendeskHistory,
		humanSupportRouting,
		pendingHumanSupportRequest,
		setPendingHumanSupportRequest,
	} = useOdieAssistantContext();
	const isTestMode = isTestModeEnvironment();
	const hasEnTranslation = useHasEnTranslation();
	const createZendeskConversation = useCreateZendeskConversation();
	const requestHumanSupport = useRequestHumanSupport();
	// With a routing step, the host decides who gets a human.
	const canRequestHuman = isUserEligibleForPaidSupport || !! humanSupportRouting;
	const [ searchParams, setSearchParams ] = useSearchParams();
	const navigate = useNavigate();
	const isForwardingToZendesk =
		searchParams.get( 'provider' ) === 'zendesk' && chat.provider !== 'zendesk';
	const isStartingDirectChat = isForwardingToZendesk && canRequestHuman && ! chat.conversationId;
	const isWaitingForChatClient = isStartingDirectChat && ! forceEmailSupport && ! isChatLoaded;
	const [ hasChatClientTimedOut, setHasChatClientTimedOut ] = useState( false );
	const [ shouldEnableAutoScroll, setShouldEnableAutoScroll ] = useState( true );
	const { data: supportInteraction, isLoading: isLoadingSupportInteraction } =
		useCurrentSupportInteraction();
	const { loggedOutOdieChatId } = useLoggedOutSession();
	// Whether the chat on show is the one the route leads to. Following a link from another chat, the
	// provider swaps the linked chat in only after this component's effects run.
	const isShowingLinkedChat =
		! isLoadingSupportInteraction &&
		String( chat.odieId ?? '' ) ===
			String( loggedOutOdieChatId || getOdieIdFromInteraction( supportInteraction ) || '' );
	const navType: NavigationType = useNavigationType();

	const messagesContainerRef = useRef< HTMLDivElement >( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );

	const interactionStatusByUuid = useOpenInteractionStatusMap();

	useZendeskMessageListener();
	const isScrolling = useAutoScroll( messagesContainerRef, shouldEnableAutoScroll );
	useHelpCenterChatScroll( supportInteraction?.uuid, scrollParentRef, ! shouldEnableAutoScroll );

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
		if ( isForwardingToZendesk && ! canRequestHuman ) {
			searchParams.delete( 'provider' );
		}
	}, [ isForwardingToZendesk, canRequestHuman, searchParams ] );

	// Don't leave someone waiting on a chat client that never loads.
	useEffect( () => {
		if ( ! isWaitingForChatClient ) {
			return;
		}
		const timeoutId = setTimeout( () => setHasChatClientTimedOut( true ), CHAT_CLIENT_TIMEOUT_MS );
		return () => clearTimeout( timeoutId );
	}, [ isWaitingForChatClient ] );

	/**
	 * Handle the case where we are directly forwarding to Zendesk without AI first.
	 * Check eligibility here too: the effect above only edits the params, so `isForwardingToZendesk`
	 * stays true for this render, and the chat can be loaded without paid support (an open human chat).
	 */
	useEffect( () => {
		// Wait for the chat to load: loading a new chat replaces its messages, including any added here.
		// Read the param again: a run of this effect for the same render may have removed it already.
		// A routing step shows in the chat the request is made in, so wait for the chat the link leads
		// to. Without one, the human chat starts at once and replaces whatever is on show.
		if (
			! isStartingDirectChat ||
			chat.status === 'loading' ||
			searchParams.get( 'provider' ) !== 'zendesk' ||
			( humanSupportRouting && ! isShowingLinkedChat )
		) {
			return;
		}

		// When the chat can't start, say why and stop forwarding. The message offers what the user
		// can do instead, and they can still ask the AI.
		const stopForwarding = ( message: Message, reason: string ) => {
			searchParams.delete( 'provider' );
			setSearchParams( searchParams );
			addMessage( message );
			trackEvent( 'direct_chat_unavailable', { reason } );
		};

		if ( forceEmailSupport ) {
			stopForwarding( getOdieEmailFallbackMessage(), 'email_only' );
			return;
		}

		if ( ! isChatLoaded ) {
			if ( hasChatClientTimedOut ) {
				setHasChatClientTimedOut( false );
				stopForwarding( getOdieZendeskConnectionErrorMessage(), 'chat_client_timeout' );
			}
			return;
		}

		searchParams.delete( 'provider' );
		searchParams.set( 'direct-zd-chat', '1' );
		setSearchParams( searchParams );

		// Compute from a fresh Smooch snapshot at call time: Smooch can mutate its
		// conversation list outside React without triggering a re-render.
		const { mostRecentSupportInteractionId: alreadyHasActiveZendeskChatId, hasReachedLimit } =
			getOpenLiveInteractions( interactionStatusByUuid );

		// when forwarding to zd avoid creating new chats
		if ( alreadyHasActiveZendeskChatId ) {
			// Redirect to the existing Zendesk chat.
			searchParams.set( 'id', alreadyHasActiveZendeskChatId );
			navigate( '/odie?' + searchParams.toString() );
			return;
		}

		// Don't create a new conversation if the user has reached the limit. Offer the open ones instead.
		if ( hasReachedLimit ) {
			addMessage( getConversationLimitReachedMessage() );
			trackEvent( 'conversation_limit_reached', { created_from: 'direct_url' } );
			return;
		}

		searchParams.delete( 'id' );
		setSearchParams( searchParams );
		requestHumanSupport( {
			createdFrom: 'direct_url',
			flags: NO_HUMAN_SUPPORT_FLAGS,
		} );
	}, [
		navigate,
		isStartingDirectChat,
		chat.status,
		isChatLoaded,
		hasChatClientTimedOut,
		addMessage,
		trackEvent,
		requestHumanSupport,
		forceEmailSupport,
		humanSupportRouting,
		isShowingLinkedChat,
		interactionStatusByUuid,
		searchParams,
		setSearchParams,
	] );

	const RoutingStep = humanSupportRouting?.Step;
	const startRoutedChat = () => {
		if ( ! pendingHumanSupportRequest ) {
			return;
		}
		const { createdFrom, isFromError, errorReason, escalationOnSecondAttempt } =
			pendingHumanSupportRequest;
		setPendingHumanSupportRequest( null );
		createZendeskConversation( {
			createdFrom,
			isFromError,
			errorReason,
			escalationOnSecondAttempt,
		} );
	};

	return (
		<div
			className={ clsx( 'chatbox-messages', {
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
					<div key={ getMessageUniqueIdentifier( message, `chat-message-${ index }` ) }>
						{ [ 'bot', 'business' ].includes( message.role ) && message.content }
					</div>
				) ) }
			</div>
			<>
				<div
					className={ clsx( 'chatbox-loading-chat__spinner', {
						'is-visible': chat.status === 'loading' || ( isScrolling && chat.status !== 'sending' ),
					} ) }
				>
					<Spinner />
				</div>
				{ ( chat.odieId || chat.provider !== 'zendesk' ) && (
					<ChatMessage
						message={ getOdieInitialMessage(
							supportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY,
							currentUser?.display_name,
							hasEnTranslation,
							launcherContext
						) }
						key={ 0 }
					/>
				) }
				{ chat.messages?.length > 0 && (
					<MessagesClusterizer
						messages={ chat.messages }
						isLoadingZendeskHistory={ isLoadingZendeskHistory }
					/>
				) }
				<JumpToRecent containerReference={ messagesContainerRef } />

				{ chat.provider === 'odie' && chat.status === 'sending' && <ThinkingPlaceholder /> }
				{ chat.provider === 'odie' && ( chat.status === 'transfer' || isWaitingForChatClient ) && (
					<ThinkingPlaceholder
						content={
							__( 'Requesting human support', __i18n_text_domain__ ) +
							( isTestMode ? '… (ZENDESK STAGING)' : '…' )
						}
					/>
				) }
				{ chat.provider === 'odie' && RoutingStep && pendingHumanSupportRequest && (
					<RoutingStep
						request={ pendingHumanSupportRequest }
						startChat={ startRoutedChat }
						dismiss={ () => setPendingHumanSupportRequest( null ) }
					/>
				) }
				{ chat.provider.startsWith( 'zendesk' ) && (
					<ZendeskTypingIndicator conversationId={ chat.conversationId } />
				) }
			</>
		</div>
	);
};
