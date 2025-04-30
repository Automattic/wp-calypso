/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetOdieConversations } from '@automattic/odie-client/src/data/use-get-odie-conversations';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
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

	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );
	const { data: supportInteractionsResolved, isLoading: isLoadingResolvedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'resolved' );
	const { data: supportInteractionsSolved, isLoading: isLoadingSolvedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'solved' );
	const { data: supportInteractionsClosed, isLoading: isLoadingClosedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'closed' );
	const { data: odieConversations, isLoading: isLoadingOdieConversations } =
		useGetOdieConversations();

	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
		};
	}, [] );

	const isLoadingInteractions =
		isLoadingResolvedInteractions ||
		isLoadingClosedInteractions ||
		isLoadingOpenInteractions ||
		isLoadingSolvedInteractions ||
		isLoadingOdieConversations;

	useEffect( () => {
		if ( isChatLoaded && getZendeskConversations && ! isLoadingInteractions ) {
			const allConversations = getZendeskConversations();
			const allSupportInteractions = [
				...( supportInteractionsResolved || [] ),
				...( supportInteractionsOpen || [] ),
				...( supportInteractionsClosed || [] ),
				...( supportInteractionsSolved || [] ),
			];

			const conversationsWithUpdatedStatuses = filterAndUpdateConversationsWithStatus(
				allConversations,
				allSupportInteractions
			);

			setConversations( conversationsWithUpdatedStatuses );
			setSupportInteractions( allSupportInteractions );
		}
	}, [
		isLoadingInteractions,
		supportInteractionsResolved,
		supportInteractionsOpen,
		isChatLoaded,
		supportInteractionsClosed,
		supportInteractionsSolved,
	] );

	// We need to import this function from utils, but for now we'll define it here
	const getSortedRecentAndArchivedConversations = ( {
		conversations,
	}: {
		conversations: Conversations;
	} ) => {
		const recentConversations: Conversations = [];
		const archivedConversations: Conversations = [];

		if ( Array.isArray( conversations ) ) {
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear( oneYearAgo.getFullYear() - 1 );

			conversations.forEach( ( conversation: OdieConversation | ZendeskConversation ) => {
				let createdAt: number | undefined;

				if ( 'metadata' in conversation && conversation.metadata?.createdAt ) {
					createdAt = conversation.metadata.createdAt;
				} else if ( 'createdAt' in conversation && conversation.createdAt ) {
					createdAt = conversation.createdAt;
				}

				if ( createdAt ) {
					const createdAtDate = new Date( createdAt );

					if ( createdAtDate < oneYearAgo ) {
						archivedConversations.push( conversation );

						return;
					}
				}

				recentConversations.push( conversation );
			} );
		}

		return {
			recentConversations,
			archivedConversations,
		};
	};

	// Merges conversations coming from Zendesk with conversations handled by AI, then sort by most recent first
	const mergedAndSortedConversations = [
		...( conversations ?? [] ),
		...( odieConversations ?? [] ),
	].sort( ( a, b ) => {
		const getCreatedAt = ( conversation: OdieConversation | ZendeskConversation ): number => {
			if ( 'metadata' in conversation && conversation.metadata?.createdAt ) {
				return conversation.metadata.createdAt;
			} else if ( 'createdAt' in conversation && conversation.createdAt ) {
				return conversation.createdAt;
			}

			return 0;
		};

		return getCreatedAt( b ) - getCreatedAt( a );
	} );

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
