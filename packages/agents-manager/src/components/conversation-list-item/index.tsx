/**
 * ConversationListItem Component
 * Displays a single conversation in the history list
 */

import { __, sprintf } from '@wordpress/i18n';
import {
	formatConversationDate,
	generateConversationTitle,
} from '../../utils/conversation-history-formatters';
import ConversationAvatar from '../conversation-avatar';
import type { Conversation } from '../../types';
import './style.scss';

interface Props {
	conversation: Conversation;
	onClick: ( sessionId: string ) => void;
}

export default function ConversationListItem( { conversation, onClick }: Props ) {
	const { type, id, message, createdAt } = conversation;

	const handleClick = () => {
		if ( id ) {
			onClick( id );
		}
	};

	const title = message
		? generateConversationTitle( message.text )
		: __( 'New conversation', '__i18n_text_domain__' );
	const date = formatConversationDate( createdAt );

	// Check if this is a Happiness Engineer chat
	const isHE = type === 'zendesk';
	const subtitle = isHE
		? sprintf(
				/* translators: %s: date of the conversation */
				__( 'Happiness chat · %s', '__i18n_text_domain__' ),
				date
		  )
		: date;

	return (
		<button
			className="agents-manager-conversation-list-item"
			onClick={ handleClick }
			type="button"
			disabled={ ! id }
			aria-label={ sprintf(
				/* translators: %1$s: conversation title, %2$s: conversation subtitle */
				__( 'Load conversation: %1$s, %2$s', '__i18n_text_domain__' ),
				title,
				subtitle
			) }
		>
			<ConversationAvatar type={ type } />
			<div className="agents-manager-conversation-list-item__text">
				<span className="agents-manager-conversation-list-item__title">{ title }</span>
				<span className="agents-manager-conversation-list-item__subtitle">{ subtitle }</span>
			</div>
		</button>
	);
}
