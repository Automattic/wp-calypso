import { HelpCenterSelect } from '@automattic/data-stores';
import {
	useGetSupportInteractions,
	useGetUnreadConversations,
} from '@automattic/odie-client/src/data';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useState } from 'react';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { getConversationsFromSupportInteractions, getZendeskConversations } from './utils';
import type {
	SupportInteraction,
	ZendeskConversation,
	ZendeskMessage,
} from '@automattic/odie-client';

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
	const [ conversations, setConversations ] = useState< ZendeskConversation[] >( [] );
	const [ unreadConversationsCount, setUnreadConversationsCount ] = useState( 0 );
	const [ unreadMessagesCount, setUnreadMessagesCount ] = useState( 0 );

	const [ lastMessage, setLastMessage ] = useState< ZendeskMessage >();
	const [ lastConversation, setLastConversation ] = useState< ZendeskConversation >();
	const [ lastSupportInteraction, setLastSupportInteraction ] = useState< SupportInteraction >();

	const { data: supportInteractionsResolved } = useGetSupportInteractions(
		'zendesk',
		100,
		'resolved'
	);
	const { data: supportInteractionsOpen } = useGetSupportInteractions( 'zendesk', 100, 'open' );
	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return { isChatLoaded: store.getIsChatLoaded() };
	}, [] );
	const sectionName = GetSectionName( unreadConversationsCount );
	const getUnreadNotifications = useGetUnreadConversations();

	useEffect( () => {
		if (
			isChatLoaded &&
			getZendeskConversations &&
			( ( supportInteractionsResolved && supportInteractionsResolved?.length > 0 ) ||
				( supportInteractionsOpen && supportInteractionsOpen?.length > 0 ) )
		) {
			const allConversations = getZendeskConversations();
			const supportInteractions = [
				...( supportInteractionsResolved || [] ),
				...( supportInteractionsOpen || [] ),
			];
			const conversations = getConversationsFromSupportInteractions(
				allConversations,
				supportInteractions
			);

			const lastUnreadConversation = conversations.find(
				( conversation ) => conversation.participants[ 0 ]?.unreadCount > 0
			);
			const lastConversation = lastUnreadConversation || conversations[ 0 ];
			const lastMessage = lastConversation?.messages[ lastConversation?.messages.length - 1 ];
			const lastSupportInteraction = supportInteractions.find(
				( interaction ) => interaction.uuid === lastConversation?.metadata.supportInteractionId
			);

			setLastSupportInteraction( lastSupportInteraction );
			setLastConversation( lastConversation );
			setLastMessage( lastMessage );

			const { unreadConversations, unreadMessages } = getUnreadNotifications( conversations );
			setUnreadConversationsCount( unreadConversations );
			setUnreadMessagesCount( unreadMessages );
			setConversations( conversations );
		}
	}, [ isChatLoaded, supportInteractionsResolved, supportInteractionsOpen ] );

	if ( ! conversations.length ) {
		return null;
	}

	const navigateTo =
		unreadConversationsCount === 1 || conversations.length === 1 ? '/odie' : '/chat-history';

	const chatMessage = {
		...lastMessage,
		...( unreadConversationsCount > 1
			? {
					text: __( 'Multiple Unread Messages', __i18n_text_domain__ ),
					displayName: sprintf(
						/* translators: %1$s is total number of unread messages, %2$s is the total number of chats with unread messages */
						__( '%1$s messages from %2$s chats', __i18n_text_domain__ ),
						unreadMessagesCount,
						unreadConversationsCount
					),
			  }
			: undefined ),
	} as ZendeskMessage;

	return (
		<div className="help-center-homepage-conversations">
			<h3 className="help-center-search-results__title help-center__section-title">
				{ sectionName }
			</h3>
			{ lastMessage && lastConversation ? (
				<HelpCenterSupportChatMessage
					sectionName="recent_conversations"
					key={ lastConversation.id }
					badgeCount={ unreadConversationsCount - 1 }
					message={ chatMessage }
					isUnread={ unreadMessagesCount > 0 }
					navigateTo={ navigateTo }
					supportInteraction={ lastSupportInteraction }
				/>
			) : null }
		</div>
	);
};

export default HelpCenterRecentConversations;
