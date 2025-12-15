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
import type { Conversation, ConversationType } from '../../types';
import './style.scss';

interface Props {
	conversation: Conversation;
	onClick: ( type: ConversationType, id: string ) => void;
}

export default function ConversationListItem( { conversation, onClick }: Props ) {
	const { type, id, message, supportInteraction } = conversation;
	// For Odie conversations, use supportInteraction ID
	const finalId = supportInteraction?.id || id;
	const title = generateConversationTitle( message.text );
	const subtitle = generateConversationSubtitle( type, message.received );

	return (
		<button
			className="agents-manager-conversation-list-item"
			type="button"
			onClick={ () => onClick( type, finalId ) }
			disabled={ ! finalId }
			aria-label={ sprintf(
				/* translators: %s: conversation title */
				__( 'Load conversation: %s', '__i18n_text_domain__' ),
				title
			) }
		>
			<ConversationAvatar type={ type } />
			<div className="agents-manager-conversation-list-item__text">
				<p className="agents-manager-conversation-list-item__title">{ title }</p>
				<p className="agents-manager-conversation-list-item__subtitle">{ subtitle }</p>
			</div>
		</button>
	);
}
