/**
 * ConversationHistoryView Component
 * Displays the list of past conversations with search and "new chat" action
 */

import { Button } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useConversationList from '../../hooks/use-conversation-list';
import ConversationListItem from '../conversation-list-item';
import ConversationListSkeleton from '../conversation-list-skeleton';
import type { ConversationType } from '../../types';
import './style.scss';

interface Props {
	agentId: string;
	authProvider?: () => Promise< Record< string, string > >;
	onSelectConversation: ( type: ConversationType, id: string ) => void;
	onNewChat: () => void;
}

export default function ConversationHistoryView( {
	agentId,
	authProvider,
	onSelectConversation = () => {},
	onNewChat,
}: Props ) {
	// To use the latest onSelectConversation in the callback
	const onSelectConversationRef = useRef( onSelectConversation );
	onSelectConversationRef.current = onSelectConversation;

	const { conversations, status } = useConversationList( {
		agentId,
		authProvider,
	} );

	return (
		<div className="agents-manager-conversation-history-view">
			<div className="agents-manager-conversation-history-view__content">
				{ /* Status states: error, loading, empty */ }
				{ status === 'error' && (
					<div className="agents-manager-conversation-history-view__error">
						<p>
							{ __( 'Failed to load conversations. Please try again.', '__i18n_text_domain__' ) }
						</p>
					</div>
				) }
				{ status === 'loading' && (
					<div className="agents-manager-conversation-history-view__loading">
						<ConversationListSkeleton count={ 5 } />
					</div>
				) }
				{ status === 'empty' && (
					<div className="agents-manager-conversation-history-view__empty">
						<p>{ __( 'No past conversations', '__i18n_text_domain__' ) }</p>
						<p className="agents-manager-conversation-history-view__empty-hint">
							{ __( 'Start a new chat to begin', '__i18n_text_domain__' ) }
						</p>
					</div>
				) }

				{ /* Conversation list */ }
				{ status === 'success' && (
					<div className="agents-manager-conversation-history-view__list">
						{ conversations.map( ( conversation ) => (
							<ConversationListItem
								key={ conversation.id }
								conversation={ conversation }
								onClick={ ( type, id ) => onSelectConversationRef.current( type, id ) }
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
