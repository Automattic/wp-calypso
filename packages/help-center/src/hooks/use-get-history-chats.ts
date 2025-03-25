/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import {
	filterAndUpdateConversationsWithStatus,
	getZendeskConversations,
} from '../components/utils';
import { HELP_CENTER_STORE } from '../stores';
import type { SupportInteraction, ZendeskConversation } from '@automattic/odie-client';

interface UseGetHistoryChatsResult {
	conversations: ZendeskConversation[];
	supportInteractions: SupportInteraction[];
	isLoadingInteractions: boolean;
	recentConversations: ZendeskConversation[];
	archivedConversations: ZendeskConversation[];
}

export const useGetHistoryChats = (): UseGetHistoryChatsResult => {
	const [ conversations, setConversations ] = useState< ZendeskConversation[] >( [] );
	const [ supportInteractions, setSupportInteractions ] = useState< SupportInteraction[] >( [] );

	const { data: supportInteractionsOpen, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );
	const { data: supportInteractionsResolved, isLoading: isLoadingResolvedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'resolved' );
	const { data: supportInteractionsSolved, isLoading: isLoadingSolvedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'solved' );
	const { data: supportInteractionsClosed, isLoading: isLoadingClosedInteractions } =
		useGetSupportInteractions( 'zendesk', 100, 'closed' );

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
		isLoadingSolvedInteractions;

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

	const { recentConversations, archivedConversations } = getSortedRecentAndArchivedConversations( {
		conversations,
	} );

	return {
		conversations,
		supportInteractions,
		isLoadingInteractions,
		recentConversations,
		archivedConversations,
	};
};
