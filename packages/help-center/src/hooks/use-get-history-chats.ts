/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetOdieConversations } from '@automattic/odie-client/src/data/use-get-odie-conversations';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	filterAndUpdateConversationsWithStatus,
	getLastMessage,
	getZendeskConversations,
} from '../components/utils';
import { HELP_CENTER_STORE } from '../stores';
import type {
	Conversations,
	OdieConversation,
	SupportInteraction,
	ZendeskConversation,
} from '@automattic/odie-client';

const NO_MESSAGE_CONTENTS = [ '--', null, undefined, '' ];

interface UseGetHistoryChatsResult {
	supportInteractions: SupportInteraction[];
	isLoadingInteractions: boolean;
	recentConversations: Conversations;
	archivedConversations: Conversations;
}

/**
 * Retrieves the date when the last message from the specified conversation was received.
 * @returns The timestamp in milliseconds (e.g. 1745936539027), or 0 if not available
 */
const getLastMessageReceived = ( conversation: OdieConversation | ZendeskConversation ) => {
	const lastMessage = getLastMessage( { conversation } );

	return ( lastMessage?.received || 0 ) * 1000;
};

/**
 * Returns Odie conversations that do not have any corresponding Zendesk support interaction.
 */
const getOdieConversationsWithNoSupportInteractions = (
	odieConversations: OdieConversation[] = [],
	supportInteractions: SupportInteraction[]
): OdieConversation[] => {
	const eventExternalIds = new Set(
		supportInteractions
			.flatMap( ( interaction ) => interaction.events || [] )
			.filter( ( event ) => event.event_source === 'odie' )
			.map( ( event ) => event.event_external_id )
	);

	return odieConversations.filter( ( conversation ) => ! eventExternalIds.has( conversation.id ) );
};

/**
 * Checks if the message content is one of the predefined "no message" contents.
 * @param text The message content to check.
 * @returns True if the message content is one of the predefined "no message" contents, false otherwise.
 */
const isNoMessageContent = ( text: unknown ) => {
	if ( text === null || text === undefined ) {
		return NO_MESSAGE_CONTENTS.includes( text );
	}
	if ( typeof text === 'string' ) {
		return NO_MESSAGE_CONTENTS.includes( text.trim() );
	}
	return false;
};

/**
 * Splits conversations into recent and archived based on whether the last message was received within the past year.
 */
const splitConversationsByRecency = (
	conversations: ( OdieConversation | ZendeskConversation )[]
): { recent: Conversations; archived: Conversations } => {
	const oneYearAgoDate = new Date();
	oneYearAgoDate.setFullYear( oneYearAgoDate.getFullYear() - 1 );
	const oneYearAgo = oneYearAgoDate.getTime();

	const recent: Conversations = [];
	const archived: Conversations = [];

	conversations.forEach( ( conversation ) => {
		if ( getLastMessageReceived( conversation ) < oneYearAgo ) {
			archived.push( conversation );
		} else {
			recent.push( conversation );
		}
	} );

	return { recent, archived };
};

export const useGetHistoryChats = (): UseGetHistoryChatsResult => {
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

	const supportInteractions: SupportInteraction[] = useMemo(
		() => [ ...( openSupportInteraction || [] ), ...( otherSupportInteractions || [] ) ],
		[ openSupportInteraction, otherSupportInteractions ]
	);

	useEffect( () => {
		if ( ! isChatLoaded || ! getZendeskConversations || isLoadingInteractions ) {
			return;
		}

		const zendeskConversationsWithStatusesUpdated = filterAndUpdateConversationsWithStatus(
			getZendeskConversations(),
			supportInteractions
		);

		const odieConversationsWithNoSupportInteractions =
			getOdieConversationsWithNoSupportInteractions( odieConversations, supportInteractions );

		const mergedAndSortedConversations = [
			...zendeskConversationsWithStatusesUpdated,
			...odieConversationsWithNoSupportInteractions,
		]
			.filter( ( conversation ) => ! isNoMessageContent( conversation.messages[ 0 ]?.text ) )
			.sort( ( a, b ) => {
				return getLastMessageReceived( b ) - getLastMessageReceived( a );
			} );

		const { recent, archived } = splitConversationsByRecency( mergedAndSortedConversations );

		setRecentConversations( recent );
		setArchivedConversations( archived );
	}, [
		isChatLoaded,
		isLoadingInteractions,
		openSupportInteraction,
		otherSupportInteractions,
		odieConversations,
		supportInteractions,
	] );

	return {
		isLoadingInteractions,
		recentConversations,
		archivedConversations,
		supportInteractions,
	};
};
