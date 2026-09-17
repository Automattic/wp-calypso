import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import Smooch from 'smooch';
import type { ZendeskConversation } from './types';

// Help Center @wordpress/data store key, hardcoded to avoid depending on
// @automattic/help-center (which depends back on this package). Mirrors the
// STORE_KEY registered by @automattic/data-stores' help-center store.
const HELP_CENTER_STORE = 'automattic/help-center';

export const calculateUnread = (
	conversations: Conversation[] | ZendeskConversation[] | undefined | null
) => {
	if ( ! Array.isArray( conversations ) || conversations.length === 0 ) {
		return { numberOfUnreadConversations: 0, numberOfUnreadMessages: 0 };
	}

	let numberOfUnreadConversations = 0;
	let numberOfUnreadMessages = 0;

	conversations.forEach( ( conversation ) => {
		const unreadCount = conversation?.participants?.[ 0 ]?.unreadCount ?? 0;
		if ( conversation.metadata?.supportInteractionId && unreadCount > 0 ) {
			numberOfUnreadConversations++;
			numberOfUnreadMessages += unreadCount;
		}
	} );

	return { numberOfUnreadConversations, numberOfUnreadMessages };
};

export const useGetUnreadConversations = () => {
	const { setUnreadCount } = useDataStoreDispatch( HELP_CENTER_STORE );

	return useCallback(
		( conversations?: Conversation[] | ZendeskConversation[] ) => {
			const conversationsToCheck = conversations ? conversations : Smooch?.getConversations?.();
			const { numberOfUnreadConversations, numberOfUnreadMessages } =
				calculateUnread( conversationsToCheck );
			setUnreadCount( numberOfUnreadConversations );

			return { numberOfUnreadConversations, numberOfUnreadMessages };
		},
		[ setUnreadCount ]
	);
};
