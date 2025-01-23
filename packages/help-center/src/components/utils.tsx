import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { HELP_CENTER_STORE } from '../stores';
import type { ContactOption } from '../types';
import type { ZendeskConversation, SupportInteraction } from '@automattic/odie-client';

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

export const getConversationsFromSupportInteractions = (
	conversations: ZendeskConversation[],
	supportInteractions: SupportInteraction[]
) => {
	return conversations.filter( ( conversation ) =>
		supportInteractions.some(
			( interaction ) => interaction.uuid === conversation.metadata?.supportInteractionId
		)
	);
};

export const matchSupportInteractionId = (
	getConversations: () => ZendeskConversation[],
	isChatLoaded: boolean,
	currentSupportInteraction: SupportInteraction | undefined
) => {
	if ( currentSupportInteraction && isChatLoaded && getConversations ) {
		const conversations = getConversations();
		const getCurrentSupportInteractionId = currentSupportInteraction?.events.find(
			( event ) => event.event_source === 'zendesk'
		)?.event_external_id;
		const foundMatch = conversations.find( ( conversation ) => {
			return conversation.id === getCurrentSupportInteractionId;
		} );

		return foundMatch;
	}
};

export const useGetMostRecentOpenConversation = () => {
	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
		};
	}, [] );

	const { data: supportInteractionsResolved, isLoading: isLoadingResolvedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'resolved' );

	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );

	const isLoadingInteractions = isLoadingResolvedInteractions || isLoadingOpenInteractions;

	if ( isChatLoaded && getZendeskConversations && ! isLoadingInteractions ) {
		const allConversations = getZendeskConversations();
		const supportInteractions = [
			...( supportInteractionsResolved || [] ),
			...( supportInteractionsOpen || [] ),
		];

		const filteredConversations = getConversationsFromSupportInteractions(
			allConversations,
			supportInteractions
		);

		const recentConversations = filteredConversations?.sort( ( conversationA, conversationB ) => {
			const aCreatedAt = conversationA.metadata?.createdAt;
			const bCreatedAt = conversationB.metadata?.createdAt;
			if ( aCreatedAt && bCreatedAt ) {
				return new Date( bCreatedAt ).getTime() - new Date( aCreatedAt ).getTime();
			}
			return 0;
		} );

		if ( recentConversations?.length > 0 ) {
			return recentConversations[ 0 ];
		}
	}
	return null;
};
