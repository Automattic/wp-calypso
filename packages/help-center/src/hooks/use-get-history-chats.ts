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
import type { Conversations, SupportInteraction } from '@automattic/odie-client';

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
	const [ recentConversations, setRecentConversations ] = useState< Conversations >( [] );
	const [ archivedConversations, setArchivedConversations ] = useState< Conversations >( [] );

	const { data: openSupportInteraction, isLoading: isLoadingOpenInteractions } =
		useGetSupportInteractions( 'zendesk', 10, 'open' );
	const { data: otherSupportInteractions, isLoading: isLoadingOtherSupportInteractions } =
		useGetSupportInteractions( 'zendesk', 100, [ 'resolved', 'solved', 'closed' ] );
	const { data: odieConversations, isLoading: isLoadingOdieConversations } =
		useGetOdieConversations();

	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return { isChatLoaded: store.getIsChatLoaded() };
	}, [] );

	const isLoadingInteractions =
		isLoadingOpenInteractions || isLoadingOtherSupportInteractions || isLoadingOdieConversations;

	useEffect( () => {
		if ( ! isChatLoaded || ! getZendeskConversations || isLoadingInteractions ) {
			return;
		}

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

		// Filter Odie conversations not already present in support interactions
		const eventExternalIds = new Set(
			allSupportInteractions
				.flatMap( ( interaction ) => interaction.events || [] )
				.filter( ( event ) => event.event_source === 'odie' )
				.map( ( event ) => event.event_external_id )
		);

		const filteredOdieConversations = ( odieConversations || [] ).filter(
			( conversation ) => ! eventExternalIds.has( conversation.id )
		);

		const mergedAndSortedConversations = [
			...conversationsWithUpdatedStatuses,
			...filteredOdieConversations,
		].sort( ( a, b ) => {
			const createdAtA = getConversationCreatedAt( a ) ?? 0;
			const createdAtB = getConversationCreatedAt( b ) ?? 0;
			return createdAtB - createdAtA;
		} );

		// Split into recent and archived
		const oneYearAgoDate = new Date();
		oneYearAgoDate.setFullYear( oneYearAgoDate.getFullYear() - 1 );
		const oneYearAgo = oneYearAgoDate.getTime();

		const recent: Conversations = [];
		const archived: Conversations = [];

		mergedAndSortedConversations.forEach( ( conversation ) => {
			const createdAt = getConversationCreatedAt( conversation );
			if ( typeof createdAt === 'number' && createdAt < oneYearAgo ) {
				archived.push( conversation );
			} else {
				recent.push( conversation );
			}
		} );

		setRecentConversations( recent );
		setArchivedConversations( archived );
	}, [
		isChatLoaded,
		isLoadingInteractions,
		openSupportInteraction,
		otherSupportInteractions,
		odieConversations,
	] );

	return {
		conversations,
		supportInteractions,
		isLoadingInteractions,
		recentConversations,
		archivedConversations,
	};
};
