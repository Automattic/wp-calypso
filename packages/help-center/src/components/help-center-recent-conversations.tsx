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

const calculateUnread = ( conversations ) => {
	let unreadConversations = 0;
	let unreadMessages = 0;

	conversations.forEach( ( conversation ) => {
		let currentUnreadMessages = 0;
		const userLastRead = conversation.participants[ 0 ].lastRead;

		conversation.messages.forEach( ( message ) => {
			if ( message.received > userLastRead ) {
				currentUnreadMessages++;
			}
		} );

		unreadMessages += currentUnreadMessages;

		if ( currentUnreadMessages > 0 ) {
			unreadConversations++;
		}
	} );

	return { unreadConversations, unreadMessages };
};

const HelpCenterRecentConversations: React.FC = () => {
	const { __ } = useI18n();
	const { init, getConversations } = useSmooch();
	const [ conversations, setConversations ] = useState( [] );
	const [ unreadConversationsCount, setUnreadConversationsCount ] = useState( 0 );
	const [ unreadMessagesCount, setUnreadMessagesCount ] = useState( 0 );

	useEffect( () => {
		if ( init ) {
			const conversations = getConversations();
			const { unreadConversations, unreadMessages } = calculateUnread( conversations );

			setUnreadConversationsCount( unreadConversations );
			setUnreadMessagesCount( unreadMessages );
			setConversations( conversations );
		}
	}, [ init, getConversations ] );

	if ( ! conversations ) {
		return [];
	}

	const lastConversation = conversations[ conversations.length - 1 ];
	const lastMessage = lastConversation?.messages[ lastConversation?.messages.length - 1 ];

	const multipleUnreadMessages = {
		text: 'Multiple Unread Messages',
		received: lastMessage?.received,
		displayName: sprintf(
			/* translators: %1$s is total number of unread messages, %2$s is the total number of chats with unread messages */
			__( '%1$s messages from %2$s chats', __i18n_text_domain__ ),
			unreadMessagesCount,
			unreadConversationsCount
		),
		avatarUrl: 'https://secure.gravatar.com/avatar/0e5d5a8e3d1c0d8d3d1c0d8d3d1c0d8d',
		id: uuid(),
	};

	// const chatMessageKey = lastMessage.id;
	let chatMessage = lastMessage;

	if ( unreadConversationsCount > 1 ) {
		chatMessage = multipleUnreadMessages;
	}

	return (
		<div className="help-center-homepage-conversations">
			<h3 className="help-center-search-results__title help-center__section-title">
				{ GetSectionName( unreadConversationsCount ) }
			</h3>
			{ lastMessage ? (
				<HelpCenterSupportChatMessage
					key={ lastConversation.id }
					message={ chatMessage }
					isUnread={ unreadMessagesCount > 0 }
					navigateTo="odie"
				/>
			) : null }
		</div>
	);
};

export default HelpCenterRecentConversations;
