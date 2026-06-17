import Smooch from 'smooch';
import type { InteractionStatus } from '../types';
import type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';

const AGE_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 3 days

export const MAX_OPEN_CONVERSATIONS = 3;

export type InteractionStatusByUuid = Map< string, InteractionStatus >;

/**
 * A conversation is open unless one of these says otherwise:
 * - it hasn't been updated within AGE_THRESHOLD (stale — true even with no messages),
 * - it carries a terminal Smooch message (csat/form/rated),
 * - its backing SupportInteraction is closed/solved server-side.
 *
 * The backend status is authoritative: a conversation can still look open in Smooch
 * (no csat/form/rated message yet) while its interaction is already closed/solved —
 * e.g. after a ticket merge.
 */
function isOpenConversation(
	conversation: ZendeskConversation,
	interactionStatusByUuid?: InteractionStatusByUuid
): boolean {
	// Stale conversations are never open, even when they have no messages.
	if ( Date.now() - conversation.lastUpdatedAt * 1000 >= AGE_THRESHOLD ) {
		return false;
	}

	const hasTerminalMessage = conversation.messages.some(
		( message: ZendeskMessage ) =>
			message.type === 'form' ||
			message.metadata?.type === 'csat' ||
			message.metadata?.type === 'form' ||
			message.metadata?.rated
	);
	if ( hasTerminalMessage ) {
		return false;
	}

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
 * Single render-time snapshot of the open live conversations, cross-checked against the
 * cached SupportInteraction status. Reads `Smooch.getConversations()` once and derives
 * the `mostRecentSupportInteractionId`, `openCount`, and `hasReachedLimit` the callers need.
 *
 * Call as late as possible and don't cache the result: Smooch mutates its conversation
 * list outside React (e.g. on incoming messages) without triggering a re-render.
 * @param interactionStatusByUuid Optional map of supportInteractionId → InteractionStatus
 *                                from the TanStack cache. Used to skip conversations whose
 *                                backing SupportInteraction is closed/solved.
 */
export function getOpenLiveInteractions( interactionStatusByUuid?: InteractionStatusByUuid ): {
	mostRecentSupportInteractionId: string | null;
	openCount: number;
	hasReachedLimit: boolean;
} {
	const open = getConversations().filter( ( conversation ) =>
		isOpenConversation( conversation, interactionStatusByUuid )
	);
	return {
		mostRecentSupportInteractionId: ( open[ 0 ]?.metadata.supportInteractionId as string ) ?? null,
		openCount: open.length,
		hasReachedLimit: open.length >= MAX_OPEN_CONVERSATIONS,
	};
}
