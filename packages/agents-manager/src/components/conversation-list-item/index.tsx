/**
 * ConversationListItem Component
 * Displays a single conversation in the history list
 */

import { type ServerConversationListItem } from '@automattic/agenttic-client';
import { memo, useCallback } from '@wordpress/element';
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

const ConversationListItem = memo( ( { conversation, onClick }: ConversationListItemProps ) => {
	const handleClick = useCallback( () => {
		const sessionId = conversation.session_id ?? '';
		if ( sessionId ) {
			onClick( sessionId );
		}
	}, [ onClick, conversation.session_id ] );

	const botType = getBotType( conversation.bot_id );
	const title = conversation.last_message
		? generateConversationTitle( conversation.last_message.content )
		: 'New conversation';
	const date = formatConversationDate( conversation.created_at );

	// Check if this is a Happiness Engineer chat
	const isHE = botType === 'he';
	const subtitle = isHE ? `Happiness chat · ${ date }` : date;
	const disabled = ! conversation.session_id;

	return (
		<button
			className="agents-manager-conversation-list-item"
			onClick={ handleClick }
			type="button"
			disabled={ disabled }
		>
			<ConversationAvatar type={ botType } />
			<div className="agents-manager-conversation-list-item__text">
				<p className="agents-manager-conversation-list-item__title">{ title }</p>
				<p className="agents-manager-conversation-list-item__subtitle">{ subtitle }</p>
			</div>
		</button>
	);
} );

ConversationListItem.displayName = 'ConversationListItem';

export default ConversationListItem;
