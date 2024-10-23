import { HelpCenterSelect } from '@automattic/data-stores';
import { uuid } from '@automattic/odie-client/src/query';
import { useSmooch } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useState } from 'react';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import type { ZendeskConversation } from '@automattic/odie-client';

import './help-center-recent-conversations.scss';

const GetSectionName = ( unreadCount: number ) => {
	const { __ } = useI18n();
	if ( unreadCount > 1 ) {
		return __( 'Unread Conversation', __i18n_text_domain__ );
	}

	return __( 'Recent Conversation', __i18n_text_domain__ );
};

const calculateUnread = ( conversations: ZendeskConversation[] ) => {
	let unreadConversations = 0;
	let unreadMessages = 0;

	conversations.forEach( ( conversation ) => {
		const unreadCount = conversation.participants[ 0 ]?.unreadCount ?? 0;

		if ( unreadCount > 0 ) {
			unreadConversations++;
			unreadMessages += unreadCount;
		}
	} );

	return { unreadConversations, unreadMessages };
};

const HelpCenterRecentConversations: React.FC = () => {
	const { __ } = useI18n();
	const { getConversations } = useSmooch();
	const [ conversations, setConversations ] = useState< ZendeskConversation[] >( [] );
	const [ unreadConversationsCount, setUnreadConversationsCount ] = useState( 0 );
	const [ unreadMessagesCount, setUnreadMessagesCount ] = useState( 0 );
	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return { isChatLoaded: store.getIsChatLoaded() };
	}, [] );

	useEffect( () => {
		if ( isChatLoaded && getConversations ) {
			const conversations = getConversations() as ZendeskConversation[];
			const { unreadConversations, unreadMessages } = calculateUnread( conversations );

			setUnreadConversationsCount( unreadConversations );
			setUnreadMessagesCount( unreadMessages );
			setConversations( conversations );
		}
	}, [ isChatLoaded, getConversations ] );

	if ( ! conversations ) {
		return [];
	}

	const lastConversation = conversations[ 0 ];
	const lastMessage = lastConversation?.messages[ lastConversation?.messages.length - 1 ];

	const multipleUnreadMessages = {
		...lastMessage,
		text: 'Multiple Unread Messages',
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
					conversation={ lastConversation }
					badgeCount={ unreadConversationsCount - 1 }
					avatarSize={ 38 }
					message={ chatMessage }
					isUnread={ unreadMessagesCount > 0 }
				/>
			) : null }
		</div>
	);
};

export default HelpCenterRecentConversations;
