/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetOdieConversations } from '@automattic/odie-client/src/data/use-get-odie-conversations';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { getConversationCreatedAt } from '@automattic/odie-client/src/utils';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import {
	filterAndUpdateConversationsWithStatus,
	getZendeskConversations,
} from '../components/utils';
import { HELP_CENTER_STORE } from '../stores';
import type {
	Conversations,
	OdieConversation,
	SupportInteraction,
	ZendeskConversation,
} from '@automattic/odie-client';

interface UseGetHistoryChatsResult {
	conversations: Conversations;
	supportInteractions: SupportInteraction[];
	isLoadingInteractions: boolean;
	recentConversations: Conversations;
	archivedConversations: Conversations;
}

export const useGetHistoryChats = (): UseGetHistoryChatsResult => {
	const [ conversations, setConversations ] = useState< Conversations >( [] );
	const [ supportInteractions, setSupportInteractions ] = useState< SupportInteraction[] >( [] );

	const { data: openSupportInteraction, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );
	const { data: otherSupportInteractions, isLoading: isLoadingOtherSupportInteractions } =
		useGetSupportInteractions( 'zendesk', 100, [ 'resolved', 'solved', 'closed' ] );
	const { data: odieConversations, isLoading: isLoadingOdieConversations } =
		useGetOdieConversations();

	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		return {
			isChatLoaded: store.getIsChatLoaded(),
		};
	}, [] );

	const isLoadingInteractions =
		isLoadingOpenInteractions || isLoadingOtherSupportInteractions || isLoadingOdieConversations;

	useEffect( () => {
		if ( isChatLoaded && getZendeskConversations && ! isLoadingInteractions ) {
			const allConversations = getZendeskConversations();
			const allSupportInteractions = [
				...( openSupportInteraction || [] ),
				...( otherSupportInteractions || [] ),
			];

			const conversationsWithUpdatedStatuses = filterAndUpdateConversationsWithStatus(
				allConversations,
				allSupportInteractions
			);

			setConversations( conversationsWithUpdatedStatuses );
			setSupportInteractions( allSupportInteractions );
		}
	}, [ isChatLoaded, isLoadingInteractions, openSupportInteraction, otherSupportInteractions ] );

	// We need to import this function from utils, but for now we'll define it here
	const getSortedRecentAndArchivedConversations = ( {
		conversations,
	}: {
		conversations: Conversations;
	} ) => {
		const recentConversations: Conversations = [];
		const archivedConversations: Conversations = [];

		if ( Array.isArray( conversations ) ) {
			const oneYearAgoDate = new Date();
			oneYearAgoDate.setFullYear( oneYearAgoDate.getFullYear() - 1 );
			const oneYearAgo = oneYearAgoDate.getTime();

			conversations.forEach( ( conversation: OdieConversation | ZendeskConversation ) => {
				const createdAt = getConversationCreatedAt( conversation );

				if ( typeof createdAt === 'number' && createdAt < oneYearAgo ) {
					archivedConversations.push( conversation );

					return;
				}

				recentConversations.push( conversation );
			} );
		}

		return {
			recentConversations,
			archivedConversations,
		};
	};

	// Merges conversations coming from Zendesk with those coming from Odie, then sort them by most recent first
	const mergedAndSortedConversations = [ ...conversations, ...( odieConversations ?? [] ) ].sort(
		( a, b ) => {
			const createdAtA = getConversationCreatedAt( a ) ?? 0;
			const createdAtB = getConversationCreatedAt( b ) ?? 0;

			return createdAtB - createdAtA;
		}
	);

	const { recentConversations, archivedConversations } = getSortedRecentAndArchivedConversations( {
		conversations: mergedAndSortedConversations,
	} );

	return {
		conversations,
		supportInteractions,
		isLoadingInteractions,
		recentConversations,
		archivedConversations,
	};
};
