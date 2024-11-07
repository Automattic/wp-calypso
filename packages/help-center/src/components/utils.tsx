import { recordTracksEvent } from '@automattic/calypso-analytics';
import type { ContactOption } from '../types';
import type { ZendeskConversation } from '@automattic/odie-client';

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

export const getLastMessage = ( { conversation }: { conversation: ZendeskConversation } ) => {
	return Array.isArray( conversation.messages ) && conversation.messages.length > 0
		? conversation.messages[ conversation.messages.length - 1 ]
		: null;
};

export const getFilteredConversations = ( {
	conversations,
}: {
	conversations: ZendeskConversation[];
} ) => {
	const recentConversations: ZendeskConversation[] = [];
	const archivedConversations: ZendeskConversation[] = [];

	if ( Array.isArray( conversations ) ) {
		conversations.forEach( ( conversation: ZendeskConversation ) => {
			if ( ! conversation?.metadata?.createdAt ) {
				recentConversations.push( conversation );
				return;
			}

			const createdAt = conversation.metadata?.createdAt;
			const createdAtDate = new Date( createdAt as string | number | Date );
			const now = new Date();
			const oneYearAgo = new Date( now.setFullYear( now.getFullYear() - 1 ) );

			if ( createdAtDate < oneYearAgo ) {
				archivedConversations.push( conversation );
			} else {
				recentConversations.push( conversation );
			}
		} );
	}

	if ( recentConversations.length > 0 ) {
		recentConversations.sort( ( a, b ) => {
			const aUnreadCount = a?.participants[ 0 ]?.unreadCount ?? 0;
			const bUnreadCount = b?.participants[ 0 ]?.unreadCount ?? 0;
			const aLastMessage = getLastMessage( { conversation: a } );
			const bLastMessage = getLastMessage( { conversation: b } );

			if ( aUnreadCount < bUnreadCount ) {
				if ( aUnreadCount === 0 || bUnreadCount === 0 ) {
					return 1;
				}
				if ( aLastMessage === null || bLastMessage === null ) {
					return aLastMessage === null ? 1 : -1;
				}
				return aLastMessage < bLastMessage ? 1 : -1;
			} else if ( aUnreadCount > bUnreadCount ) {
				if ( aUnreadCount === 0 || bUnreadCount === 0 ) {
					return -1;
				}
				if ( aLastMessage === null || bLastMessage === null ) {
					return aLastMessage === null ? 1 : -1;
				}
				return aLastMessage < bLastMessage ? -1 : 1;
			}
			return 0;
		} );
	}

	return {
		recentConversations,
		archivedConversations,
	};
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

export const getClientId = ( conversations: ZendeskConversation[] ): string =>
	conversations
		.flatMap( ( conversation ) => conversation.messages )
		.find( ( message ) => message.source.type === 'web' && message.source.id )?.source.id || '';
