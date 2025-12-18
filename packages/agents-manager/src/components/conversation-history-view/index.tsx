/**
 * ConversationHistoryView Component
 * Displays the list of past conversations with a "new chat" action
 */

import { Button } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useConversationList from '../../hooks/use-conversation-list';
import ConversationListItem from '../conversation-list-item';
import ConversationListSkeleton from '../conversation-list-skeleton';
import './style.scss';

interface Props {
	agentId: string;
	authProvider?: () => Promise< Record< string, string > >;
	onSelectConversation: ( sessionId: string ) => void;
	onNewChat: () => void;
}

export default function ConversationHistoryView( {
	agentId,
	authProvider,
	onSelectConversation,
	onNewChat,
}: Props ) {
	// To use the latest onSelectConversation in the callback
	const onSelectConversationRef = useRef( onSelectConversation );
	onSelectConversationRef.current = onSelectConversation;

	const { conversations, isLoading, isError } = useConversationList( {
		agentId,
		authProvider,
	} );

	return (
		<div className="agents-manager-conversation-history-view">
			<div className="agents-manager-conversation-history-view__content">
				{ /* States: loading → error → empty → list */ }
				{ isLoading && (
					<div className="agents-manager-conversation-history-view__loading">
						<ConversationListSkeleton count={ 5 } />
					</div>
				) }
				{ ! isLoading && isError && (
					<div className="agents-manager-conversation-history-view__error">
						<p>
							{ __( 'Failed to load conversations. Please try again.', '__i18n_text_domain__' ) }
						</p>
					</div>
				) }
				{ ! isLoading && ! isError && conversations.length === 0 && (
					<div className="agents-manager-conversation-history-view__empty">
						<p>{ __( 'No past conversations', '__i18n_text_domain__' ) }</p>
						<p className="agents-manager-conversation-history-view__empty-hint">
							{ __( 'Start a new chat to begin', '__i18n_text_domain__' ) }
						</p>
					</div>
				) }
				{ ! isLoading && ! isError && conversations.length > 0 && (
					<div className="agents-manager-conversation-history-view__list">
						{ conversations.map( ( conversation ) => (
							<ConversationListItem
								key={ conversation.session_id }
								conversation={ conversation }
								onClick={ ( sessionId ) => onSelectConversationRef.current( sessionId ) }
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
