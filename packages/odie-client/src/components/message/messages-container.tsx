import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clx from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { NavigationType, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { getOdieInitialMessage, ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useCurrentSupportInteraction } from '../../data/use-current-support-interaction';
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
import { getMessageUniqueIdentifier } from './utils/get-message-unique-identifier';
import { ZendeskTypingIndicator } from './zendesk-typing-indicator';
import ChatMessage from '.';
import type { CurrentUser } from '../../types';
interface ChatMessagesProps {
	currentUser: CurrentUser;
}

export const MessagesContainer = ( { currentUser }: ChatMessagesProps ) => {
	const { chat, isChatLoaded, isUserEligibleForPaidSupport, forceEmailSupport } =
		useOdieAssistantContext();
	const isTestMode = isTestModeEnvironment();
	const createZendeskConversation = useCreateZendeskConversation();
	const [ searchParams, setSearchParams ] = useSearchParams();
	const navigate = useNavigate();
	const isForwardingToZendesk =
		searchParams.get( 'provider' ) === 'zendesk' && chat.provider !== 'zendesk';
	const [ shouldEnableAutoScroll, setShouldEnableAutoScroll ] = useState( true );
	const { data: supportInteraction } = useCurrentSupportInteraction();
	const navType: NavigationType = useNavigationType();

	const messagesContainerRef = useRef< HTMLDivElement >( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );

	const alreadyHasActiveZendeskChatId = getMostRecentOpenLiveInteraction();

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
		if ( isForwardingToZendesk && ! isUserEligibleForPaidSupport ) {
			searchParams.delete( 'provider' );
		}
	}, [ isForwardingToZendesk, isUserEligibleForPaidSupport, searchParams ] );

	/**
	 * Handle the case where we are directly forwarding to Zendesk without AI first.
	 */
	useEffect( () => {
		if ( isForwardingToZendesk && ! chat.conversationId && isChatLoaded && ! forceEmailSupport ) {
			searchParams.delete( 'provider' );
			searchParams.set( 'direct-zd-chat', '1' );
			setSearchParams( searchParams );

			// when forwarding to zd avoid creating new chats
			if ( alreadyHasActiveZendeskChatId ) {
				// Redirect to the existing Zendesk chat.
				searchParams.set( 'id', alreadyHasActiveZendeskChatId );
				return navigate( '/odie?' + searchParams.toString() );
			}

			searchParams.delete( 'id' );
			setSearchParams( searchParams );
			createZendeskConversation( {
				createdFrom: 'direct_url',
			} );
		}
	}, [
		navigate,
		isForwardingToZendesk,
		isChatLoaded,
		chat?.conversationId,
		createZendeskConversation,
		alreadyHasActiveZendeskChatId,
		forceEmailSupport,
		supportInteraction?.uuid,
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
					<div key={ getMessageUniqueIdentifier( message, `chat-message-${ index }` ) }>
						{ [ 'bot', 'business' ].includes( message.role ) && message.content }
					</div>
				) ) }
			</div>
			<>
				<div
					className={ clx( 'chatbox-loading-chat__spinner', {
						'is-visible': chat.status === 'loading' || isScrolling,
					} ) }
				>
					<Spinner />
				</div>
				{ ( chat.odieId || chat.provider !== 'zendesk' ) && (
					<ChatMessage
						message={ getOdieInitialMessage(
							supportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY,
							currentUser?.display_name
						) }
						key={ 0 }
					/>
				) }
				{ chat.messages?.length > 0 && <MessagesClusterizer messages={ chat.messages } /> }
				<JumpToRecent containerReference={ messagesContainerRef } />

				{ chat.provider === 'odie' && chat.status === 'sending' && <ThinkingPlaceholder /> }
				{ chat.provider === 'odie' && chat.status === 'transfer' && (
					<ThinkingPlaceholder
						content={
							__( 'Requesting human support', __i18n_text_domain__ ) +
							( isTestMode ? '… (ZENDESK STAGING)' : '…' )
						}
					/>
				) }
				{ chat.provider.startsWith( 'zendesk' ) && (
					<ZendeskTypingIndicator conversationId={ chat.conversationId } />
				) }
			</>
		</div>
	);
};
