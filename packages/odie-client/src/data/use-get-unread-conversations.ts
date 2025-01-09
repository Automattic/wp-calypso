import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import Smooch from 'smooch';
import { ZendeskConversation } from '../types';

const calculateUnread = ( conversations: Conversation[] | ZendeskConversation[] ) => {
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

export const useGetUnreadConversations = () => {
	const { setUnreadCount } = useDataStoreDispatch( HELP_CENTER_STORE );

	return useCallback(
		( conversations?: Conversation[] | ZendeskConversation[] ) => {
			const conversationsToCheck = conversations ? conversations : Smooch.getConversations();
			const { unreadConversations, unreadMessages } = calculateUnread( conversationsToCheck );
			setUnreadCount( unreadConversations );

			return { unreadConversations, unreadMessages };
		},
		[ setUnreadCount ]
	);
};
