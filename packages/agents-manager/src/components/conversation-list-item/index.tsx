/**
 * ConversationListItem Component
 * Displays a single conversation in the history list
 */

import { type ServerConversationListItem } from '@automattic/agenttic-client';
import { __, sprintf } from '@wordpress/i18n';
import {
	formatConversationDate,
	generateConversationTitle,
	getBotType,
} from '../../utils/formatters';
import ConversationAvatar from '../conversation-avatar';
import './style.scss';

interface ConversationListItemProps {
	conversation: ServerConversationListItem;
	onClick: ( sessionId: string ) => void;
}

export default function ConversationListItem( {
	conversation,
	onClick,
}: ConversationListItemProps ) {
	const handleClick = () => {
		const sessionId = conversation.session_id ?? '';
		if ( sessionId ) {
			onClick( sessionId );
		}
	};

	const botType = getBotType( conversation.bot_id );
	const title = conversation.last_message
		? generateConversationTitle( conversation.last_message.content )
		: __( 'New conversation', '__i18n_text_domain__' );
	const date = formatConversationDate( conversation.created_at );

	// Check if this is a Happiness Engineer chat
	const isHE = botType === 'he';
	const subtitle = isHE
		? sprintf(
				/* translators: %s: date of the conversation */
				__( 'Happiness chat · %s', '__i18n_text_domain__' ),
				date
		  )
		: date;
	const disabled = ! conversation.session_id;

	return (
		<button
			className="agents-manager-conversation-list-item"
			onClick={ handleClick }
			type="button"
			disabled={ disabled }
			aria-label={ sprintf(
				/* translators: %1$s: conversation title, %2$s: conversation subtitle */
				__( 'Load conversation: %1$s, %2$s', '__i18n_text_domain__' ),
				title,
				subtitle
			) }
		>
			<ConversationAvatar type={ botType } />
			<div className="agents-manager-conversation-list-item__text">
				<p className="agents-manager-conversation-list-item__title">{ title }</p>
				<p className="agents-manager-conversation-list-item__subtitle">{ subtitle }</p>
			</div>
		</button>
	);
}
