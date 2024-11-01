import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ZendeskConversation } from '@automattic/odie-client';
import type { ContactOption } from '../types';

export const generateContactOnClickEvent = (
	contactOption: ContactOption,
	contactOptionEventName?: string,
	isUserEligible?: boolean
) => {
	if ( contactOptionEventName ) {
		recordTracksEvent( contactOptionEventName, {
			location: 'help-center',
			contact_option: contactOption,
			is_user_eligible: isUserEligible,
		} );
	}
};

export const calculateUnread = ( conversations: ZendeskConversation[] ) => {
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
