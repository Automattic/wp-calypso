/**
 * ConversationListItem Component
 * Displays a single conversation in the history list
 */

import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import {
	generateConversationTitle,
	generateConversationSubtitle,
} from '../../utils/conversation-history-formatters';
import ConversationAvatar from '../conversation-avatar';
import type { LocalConversationListItem } from '../../types';
import './style.scss';

interface Props {
	conversation: LocalConversationListItem;
	onClick: ( conversation: LocalConversationListItem ) => void;
	isActive?: boolean;
}

export default function ConversationListItem( { conversation, onClick, isActive = false }: Props ) {
	const disabled = ! conversation.session_id && ! conversation.conversation_id;
	const title = generateConversationTitle( conversation.first_message?.content || '' );
	const subtitle = generateConversationSubtitle( conversation.first_message?.created_at || '' );

	return (
		<button
			className={ clsx( 'agents-manager-conversation-list-item', {
				'agents-manager-conversation-list-item--active': isActive,
			} ) }
			type="button"
			onClick={ () => onClick( conversation ) }
			disabled={ disabled }
			aria-current={ isActive ? 'page' : undefined }
			aria-label={ sprintf(
				/* translators: %1$s: conversation title, %2$s: conversation subtitle */
				__( 'Load conversation: %1$s, %2$s', __i18n_text_domain__ ),
				title,
				subtitle
			) }
		>
			<ConversationAvatar isHe={ conversation.is_zendesk } />
			<div className="agents-manager-conversation-list-item__text">
				<p className="agents-manager-conversation-list-item__title">{ title }</p>
				<p className="agents-manager-conversation-list-item__subtitle">{ subtitle }</p>
			</div>
		</button>
	);
}
