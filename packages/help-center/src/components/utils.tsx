import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getConversationIdFromInteraction } from '@automattic/odie-client/src/utils';
import Smooch from 'smooch';
import type { ContactOption } from '../types';
import type { ZendeskConversation, SupportInteraction } from '@automattic/odie-client';

const isMatchingInteraction = (
	supportInteraction: SupportInteraction,
	supportInteractionId: string
): boolean => {
	return supportInteraction.uuid === supportInteractionId;
};

const filterConversationsBySupportInteractions = (
	conversations: ZendeskConversation[],
	supportInteractions: SupportInteraction[]
): ZendeskConversation[] => {
	return conversations.filter( ( conversation ) =>
		supportInteractions.some( ( interaction ) =>
			isMatchingInteraction( interaction, conversation.metadata.supportInteractionId )
		)
	);
};

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

export const getZendeskConversations = () => {
	const conversations = Smooch?.getConversations?.() ?? [];
	return conversations as unknown as ZendeskConversation[];
};

export const getSortedRecentAndArchivedConversations = ( {
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

export const getClientId = ( conversations: ZendeskConversation[] ): string =>
	conversations
		.flatMap( ( conversation ) => conversation.messages )
		.find( ( message ) => message.source?.type === 'web' && message.source?.id )?.source?.id || '';

export const matchSupportInteractionId = (
	getConversations: () => ZendeskConversation[],
	isChatLoaded: boolean,
	currentSupportInteraction: SupportInteraction | undefined
) => {
	if ( currentSupportInteraction && isChatLoaded && getConversations ) {
		const conversations = getConversations();
		const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );
		return conversations.find( ( conversation ) => {
			return conversation.id === currentConversationId;
		} );
	}
};

export const filterAndUpdateConversationsWithStatus = (
	conversations: ZendeskConversation[],
	supportInteractions: SupportInteraction[]
) => {
	const filteredConversations = filterConversationsBySupportInteractions(
		conversations,
		supportInteractions
	);

	const conversationsWithUpdatedStatuses = filteredConversations.map( ( conversation ) => {
		const supportInteraction = supportInteractions.find( ( interaction ) =>
			isMatchingInteraction( interaction, conversation.metadata.supportInteractionId )
		);

		if ( ! supportInteraction ) {
			return conversation;
		}

		const updatedConversation = {
			...conversation,
			metadata: {
				...conversation.metadata,
				status: supportInteraction.status,
			},
		};

		return updatedConversation;
	} );

	return conversationsWithUpdatedStatuses;
};
