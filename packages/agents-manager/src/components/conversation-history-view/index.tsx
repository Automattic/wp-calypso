/**
 * ConversationHistoryView Component
 * Displays the list of past conversations with search and "new chat" action
 */

import { Button } from '@wordpress/components';
import { useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useConversationList from '../../hooks/use-conversation-list';
import ConversationListItem from '../conversation-list-item';
import ConversationListSkeleton from '../conversation-list-skeleton';
import './style.scss';

interface ConversationHistoryViewProps {
	botId: string;
	apiBaseUrl?: string;
	authProvider?: () => Promise< Record< string, string > >;
	onSelectConversation: ( sessionId: string ) => void;
	onNewChat: () => void;
}

export default function ConversationHistoryView( {
	botId,
	apiBaseUrl,
	authProvider,
	onSelectConversation,
	onNewChat,
}: ConversationHistoryViewProps ) {
	// To use the latest onSelectConversation in the callback
	const onSelectConversationRef = useRef( onSelectConversation );
	onSelectConversationRef.current = onSelectConversation;

	const { conversations, isLoading, error } = useConversationList( {
		botId,
		apiBaseUrl,
		authProvider,
	} );

	const handleConversationClick = useCallback( ( sessionId: string ) => {
		onSelectConversationRef.current( sessionId );
	}, [] );

	return (
		<div className="agents-manager-conversation-history-view">
			<div className="agents-manager-conversation-history-view__content">
				{ /* Loading state */ }
				{ isLoading && ! conversations.length && (
					<div className="agents-manager-conversation-history-view__loading">
						<ConversationListSkeleton count={ 5 } />
					</div>
				) }
				{ /* Error state - only show if we have no data to display */ }
				{ error && ! isLoading && ! conversations.length && (
					<div className="agents-manager-conversation-history-view__error">
						<p>
							{ __( 'Failed to load conversations. Please try again.', '__i18n_text_domain__' ) }
						</p>
					</div>
				) }
				{ /* Empty state */ }
				{ ! isLoading && ! error && ! conversations.length && (
					<div className="agents-manager-conversation-history-view__empty">
						<p>{ __( 'No past conversations', '__i18n_text_domain__' ) }</p>
						<p className="agents-manager-conversation-history-view__empty-hint">
							{ __( 'Start a new chat to begin', '__i18n_text_domain__' ) }
						</p>
					</div>
				) }{ ' ' }
				{ /* Conversation list - show whenever we have data, even while refreshing */ }
				{ conversations.length > 0 && (
					<div className="agents-manager-conversation-history-view__list">
						{ conversations.map( ( conversation ) => (
							<ConversationListItem
								key={ conversation.chat_id }
								conversation={ conversation }
								onClick={ handleConversationClick }
							/>
						) ) }
					</div>
				) }
			</div>

			{ /* New chat button */ }
			<div className="agents-manager-conversation-history-view__footer">
				<Button
					variant="primary"
					onClick={ onNewChat }
					className="agents-manager-conversation-history-view__new-chat-btn"
				>
					{ __( 'Start a new chat', '__i18n_text_domain__' ) }
				</Button>
			</div>
		</div>
	);
}
