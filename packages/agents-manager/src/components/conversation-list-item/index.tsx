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
import type { Conversation, ConversationType } from '../../types';
import './style.scss';

interface Props {
	conversation: Conversation;
	onClick: ( type: ConversationType, id: string ) => void;
}

export default function ConversationListItem( { conversation, onClick }: Props ) {
	const { type, id, message, createdAt } = conversation;

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
			onClick={ () => onClick( type, id ) }
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
				<p className="agents-manager-conversation-list-item__title">{ title }</p>
				<p className="agents-manager-conversation-list-item__subtitle">{
					// TODO: Remove the `type` debug info before release.
					// NOTE: Add a tempo `type` for us to debug which type of conversation it is.
					`${ subtitle } · ${ type }`
				}</p>
			</div>
		</button>
	);
}
