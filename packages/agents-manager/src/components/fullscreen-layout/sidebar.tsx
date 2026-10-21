import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external, plus } from '@wordpress/icons';
import { useAgentsManagerContext } from '../../contexts';
import useConversationList from '../../hooks/use-conversation-list';
import { useFullscreenConversationListRefresh } from '../../hooks/use-fullscreen-conversation-list-refresh';
import ConversationListItem from '../conversation-list-item';
import ConversationListSkeleton from '../conversation-list-skeleton';
import type { LocalConversationListItem } from '../../types';

interface Props {
	exitFullscreen: () => void;
	startNewChat: () => void;
	selectConversation: ( conversation: LocalConversationListItem ) => void;
}

export function FullscreenSidebar( { exitFullscreen, startNewChat, selectConversation }: Props ) {
	const { getTabSessionId } = useAgentsManagerContext();
	const { conversations, isLoading, isError } = useConversationList();
	useFullscreenConversationListRefresh();

	const activeSessionId = getTabSessionId();

	return (
		<aside className="agents-manager-fullscreen__sidebar">
			<div className="agents-manager-fullscreen__sidebar-header">
				<Button
					variant="secondary"
					className="agents-manager-fullscreen__new-chat"
					onClick={ startNewChat }
				>
					<Icon icon={ plus } size={ 20 } />
					{ __( 'New chat', __i18n_text_domain__ ) }
				</Button>
			</div>

			<nav
				className="agents-manager-fullscreen__sessions"
				aria-label={ __( 'Past chats', __i18n_text_domain__ ) }
			>
				{ isLoading && <ConversationListSkeleton count={ 5 } /> }
				{ ! isLoading && isError && (
					<p className="agents-manager-fullscreen__status">
						{ __( 'Failed to load conversations. Please try again.', __i18n_text_domain__ ) }
					</p>
				) }
				{ ! isLoading && ! isError && conversations.length === 0 && (
					<p className="agents-manager-fullscreen__status">
						{ __( 'No past conversations', __i18n_text_domain__ ) }
					</p>
				) }
				{ ! isLoading &&
					! isError &&
					conversations.map( ( conversation ) => (
						<ConversationListItem
							key={ conversation.session_id ?? conversation.conversation_id }
							conversation={ conversation }
							isActive={ !! conversation.session_id && conversation.session_id === activeSessionId }
							onClick={ selectConversation }
						/>
					) ) }
			</nav>

			<div className="agents-manager-fullscreen__sidebar-footer">
				<Button className="agents-manager-fullscreen__exit" onClick={ exitFullscreen }>
					<Icon icon={ external } size={ 18 } />
					{ __( 'Exit full screen', __i18n_text_domain__ ) }
				</Button>
			</div>
		</aside>
	);
}
