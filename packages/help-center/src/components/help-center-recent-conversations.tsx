import { uuid } from '@automattic/odie-client/src/query';
import { useSmooch } from '@automattic/zendesk-client';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useState } from 'react';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';

import './help-center-recent-conversations.scss';

const GetSectionName = ( unreadCount: number ) => {
	const { __ } = useI18n();
	if ( unreadCount > 1 ) {
		return __( 'Unread Conversation', __i18n_text_domain__ );
	}

	return __( 'Recent Conversation', __i18n_text_domain__ );
};

const HelpCenterRecentConversations: React.FC = () => {
	const { __ } = useI18n();
	const { init, getConversations } = useSmooch();
	const [ conversations, setConversations ] = useState( [] );

	useEffect( () => {
		if ( init ) {
			setConversations( getConversations() );
		}
	}, [ getConversations, init ] );

	if ( ! conversations ) {
		return [];
	}

	const lastConversation = conversations[ conversations.length - 1 ];
	const lastMessage = lastConversation?.messages[ lastConversation?.messages.length - 1 ];

	// Testing values here
	const unreadConversations = 0;
	const unreadMessages = 0;

	const multipleUnreadMessages = {
		text: 'Multiple Unread Messages',
		received: 1631616000,
		displayName: sprintf(
			/* translators: %1$s is total number of unread messages, %2$s is the total number of chats with unread messages */
			__( '%1$s messages from %2$s chats', __i18n_text_domain__ ),
			unreadMessages,
			unreadConversations
		),
		avatarUrl: 'https://secure.gravatar.com/avatar/0e5d5a8e3d1c0d8d3d1c0d8d3d1c0d8d',
		id: uuid(),
	};

	// const chatMessageKey = lastMessage.id;
	let chatMessage = lastMessage;

	if ( unreadConversations > 1 ) {
		chatMessage = multipleUnreadMessages;
	}

	return (
		<div className="help-center-homepage-conversations">
			<h3 className="help-center-search-results__title help-center__section-title">
				{ GetSectionName( unreadConversations ) }
			</h3>
			{ lastMessage ? (
				<HelpCenterSupportChatMessage
					key={ lastConversation.id }
					message={ chatMessage }
					isUnread={ unreadMessages > 0 }
					navigateTo="odie"
				/>
			) : null }
		</div>
	);
};

export default HelpCenterRecentConversations;
