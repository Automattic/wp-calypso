import { HelpCenterSelect } from '@automattic/data-stores';
import { useSmooch } from '@automattic/zendesk-client';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useState } from 'react';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { calculateUnread } from './utils';
import type { ZendeskConversation } from '@automattic/odie-client';

import './help-center-recent-conversations.scss';

const GetSectionName = ( unreadCount: number ) => {
	const { __ } = useI18n();
	if ( unreadCount > 1 ) {
		return __( 'Unread Conversations', __i18n_text_domain__ );
	}

	return __( 'Recent Conversation', __i18n_text_domain__ );
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
	const sectionName = GetSectionName( unreadConversationsCount );
	const { setUnreadCount } = useDataStoreDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		if ( isChatLoaded && getConversations ) {
			const conversations = getConversations() as ZendeskConversation[];
			const { unreadConversations, unreadMessages } = calculateUnread( conversations );
			setUnreadConversationsCount( unreadConversations );
			setUnreadMessagesCount( unreadMessages );
			setConversations( conversations );
			setUnreadCount( unreadConversations );
		}
	}, [ isChatLoaded, getConversations ] );

	if ( ! conversations.length ) {
		return null;
	}

	const lastUnreadConversation = conversations.find(
		( conversation ) => conversation.participants[ 0 ]?.unreadCount > 0
	);
	const lastConversation = lastUnreadConversation || conversations[ 0 ];
	const lastMessage = lastConversation?.messages[ lastConversation?.messages.length - 1 ];

	const chatMessage = {
		...lastMessage,
		...( unreadConversationsCount > 1
			? {
					text: 'Multiple Unread Messages',
					displayName: sprintf(
						/* translators: %1$s is total number of unread messages, %2$s is the total number of chats with unread messages */
						__( '%1$s messages from %2$s chats', __i18n_text_domain__ ),
						unreadMessagesCount,
						unreadConversationsCount
					),
			  }
			: undefined ),
	};

	return (
		<div className="help-center-homepage-conversations">
			<h3 className="help-center-search-results__title help-center__section-title">
				{ sectionName }
			</h3>
			{ lastMessage ? (
				<HelpCenterSupportChatMessage
					key={ lastConversation.id }
					badgeCount={ unreadConversationsCount - 1 }
					avatarSize={ 38 }
					message={ chatMessage }
					isUnread={ unreadMessagesCount > 0 }
					navigateTo="/chat-history"
				/>
			) : null }
		</div>
	);
};

export default HelpCenterRecentConversations;
