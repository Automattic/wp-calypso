/**
 * ConversationListItem Component
 * Displays a single conversation in the history list
 */

import { __, sprintf } from '@wordpress/i18n';
import {
	generateConversationTitle,
	generateConversationSubtitle,
} from '../../utils/conversation-history-formatters';
import ConversationAvatar from '../conversation-avatar';
import type { ServerConversationListItem } from '@automattic/agenttic-client';
import './style.scss';

interface Props {
	conversation: ServerConversationListItem;
	onClick: ( sessionId: string ) => void;
}

export default function ConversationListItem( { conversation, onClick }: Props ) {
	const sessionId = conversation.session_id || '';
	const title = generateConversationTitle( conversation.first_message?.content || '' );
	const subtitle = generateConversationSubtitle( conversation.first_message?.created_at || '' );

	return (
		<button
			className="agents-manager-conversation-list-item"
			type="button"
			onClick={ () => onClick( sessionId ) }
			disabled={ ! sessionId }
			aria-label={ sprintf(
				/* translators: %1$s: conversation title, %2$s: conversation subtitle */
				__( 'Load conversation: %1$s, %2$s', '__i18n_text_domain__' ),
				title,
				subtitle
			) }
		>
			<ConversationAvatar />
			<div className="agents-manager-conversation-list-item__text">
				<p className="agents-manager-conversation-list-item__title">{ title }</p>
				<p className="agents-manager-conversation-list-item__subtitle">{ subtitle }</p>
			</div>
		</button>
	);
}
