import { Button, SearchControl } from '@wordpress/components';
import { useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useConversationList from '../../hooks/use-conversation-list';
import { LocalConversationListItem } from '../../types';
import ConversationListItem from '../conversation-list-item';
import ConversationListSkeleton from '../conversation-list-skeleton';
import './style.scss';

interface Props {
	onSelectConversation: ( conversation: LocalConversationListItem ) => void;
	onNewChat: () => void;
}

export default function ConversationHistoryView( { onSelectConversation, onNewChat }: Props ) {
	// To use the latest onSelectConversation in the callback
	const onSelectConversationRef = useRef( onSelectConversation );
	onSelectConversationRef.current = onSelectConversation;
	const [ searchInput, setSearchInput ] = useState( '' );

	const { conversations, isLoading, isError } = useConversationList();
	const normalizedSearch = searchInput.trim().toLowerCase();
	const filteredConversations = useMemo( () => {
		if ( ! normalizedSearch ) {
			return conversations;
		}

		return conversations.filter( ( conversation ) =>
			( conversation.first_message?.content ?? '' ).toLowerCase().includes( normalizedSearch )
		);
	}, [ conversations, normalizedSearch ] );
	const hasSearch = normalizedSearch.length > 0;

	return (
		<div className="agents-manager-conversation-history-view">
			<div className="agents-manager-conversation-history-view__search">
				<SearchControl
					value={ searchInput }
					onChange={ setSearchInput }
					onClick={ ( e ) => e.currentTarget.focus() }
					placeholder={ __( 'Search past chats', '__i18n_text_domain__' ) }
				/>
			</div>
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
				{ ! isLoading &&
					! isError &&
					conversations.length > 0 &&
					hasSearch &&
					filteredConversations.length === 0 && (
						<div className="agents-manager-conversation-history-view__empty">
							<p>{ __( 'No matching conversations', '__i18n_text_domain__' ) }</p>
							<p className="agents-manager-conversation-history-view__empty-hint">
								{ __( 'Try a different search term', '__i18n_text_domain__' ) }
							</p>
						</div>
					) }
				{ ! isLoading && ! isError && filteredConversations.length > 0 && (
					<div className="agents-manager-conversation-history-view__list">
						{ filteredConversations.map( ( conversation ) => (
							<ConversationListItem
								key={ conversation.session_id ?? conversation.conversation_id }
								conversation={ conversation }
								onClick={ ( conversation ) => onSelectConversationRef.current( conversation ) }
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
