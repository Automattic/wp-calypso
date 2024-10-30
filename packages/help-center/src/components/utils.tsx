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

	return {
		recentConversations,
		archivedConversations,
	};
};
