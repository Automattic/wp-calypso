import Smooch from 'smooch';
import type { InteractionStatus } from '../../types';
import type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';

const AGE_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 3 days

export const MAX_OPEN_CONVERSATIONS = 3;

export type InteractionStatusByUuid = Map< string, InteractionStatus >;

function passesSmoochHeuristic( conversation: ZendeskConversation ): boolean {
	return conversation.messages.every(
		( message: ZendeskMessage ) =>
			message.type !== 'form' &&
			message.metadata?.type !== 'csat' &&
			message.metadata?.type !== 'form' &&
			! message.metadata?.rated &&
			Date.now() - conversation.lastUpdatedAt * 1000 < AGE_THRESHOLD
	);
}

function isOpenConversation(
	conversation: ZendeskConversation,
	interactionStatusByUuid?: InteractionStatusByUuid
): boolean {
	if ( ! passesSmoochHeuristic( conversation ) ) {
		return false;
	}

	// Cross-check with the cached SupportInteraction status when available.
	// A conversation whose interaction is closed/solved server-side is not open,
	// even if the Smooch heuristic hasn't caught up yet (no csat/form/rated message).
	// Conversations missing from the map (e.g. freshly created, not yet indexed)
	// fall back to the heuristic.
	const supportInteractionId = conversation.metadata?.supportInteractionId as string | undefined;
	if ( supportInteractionId && interactionStatusByUuid ) {
		const status = interactionStatusByUuid.get( supportInteractionId );
		if ( status === 'closed' || status === 'solved' ) {
			return false;
		}
	}

	return true;
}

function getConversations(): ZendeskConversation[] {
	try {
		return ( Smooch?.getConversations?.() ?? [] ) as unknown as ZendeskConversation[];
	} catch {
		return [];
	}
}

/**
 * Queries the Smooch SDK and gets the latest open conversation. Try to call as late as possible and don't cache the result.
 * @param interactionStatusByUuid Optional map of supportInteractionId → InteractionStatus from the TanStack cache.
 *                                Used to skip conversations whose backing SupportInteraction is closed/solved.
 * @returns The support interaction ID of the latest open conversation.
 */
export default function getMostRecentOpenLiveInteraction(
	interactionStatusByUuid?: InteractionStatusByUuid
) {
	const conversations = getConversations();

	// They're already sorted by lastUpdatedAt, so we can just find the first one that's open.
	const latestOpenConversation = conversations.find( ( conversation ) =>
		isOpenConversation( conversation, interactionStatusByUuid )
	);

	return ( latestOpenConversation?.metadata.supportInteractionId as string ) ?? null;
}

/**
 * Returns the number of currently open live conversations.
 */
export function getOpenLiveInteractionCount(
	interactionStatusByUuid?: InteractionStatusByUuid
): number {
	return getConversations().filter( ( conversation ) =>
		isOpenConversation( conversation, interactionStatusByUuid )
	).length;
}

/**
 * Returns true if the user has reached the maximum number of concurrent open conversations.
 */
export function hasReachedConversationLimit(
	interactionStatusByUuid?: InteractionStatusByUuid
): boolean {
	return getOpenLiveInteractionCount( interactionStatusByUuid ) >= MAX_OPEN_CONVERSATIONS;
}

/**
 * Single-pass scan of the Smooch conversation list. Returns the open-conversation
 * trio (`mostRecentId`, `openCount`, `hasReachedLimit`) from one `Smooch.getConversations()`
 * call so callers don't pay 3× SDK reads per render.
 */
export function getOpenLiveInteractions( interactionStatusByUuid?: InteractionStatusByUuid ): {
	mostRecentId: string | null;
	openCount: number;
	hasReachedLimit: boolean;
} {
	const open = getConversations().filter( ( conversation ) =>
		isOpenConversation( conversation, interactionStatusByUuid )
	);
	return {
		mostRecentId: ( open[ 0 ]?.metadata.supportInteractionId as string ) ?? null,
		openCount: open.length,
		hasReachedLimit: open.length >= MAX_OPEN_CONVERSATIONS,
	};
}
