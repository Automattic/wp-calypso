import Smooch from 'smooch';
import type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';

const AGE_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 3 days

export const MAX_OPEN_CONVERSATIONS = 3;

function isOpenConversation( conversation: ZendeskConversation ): boolean {
	return conversation.messages.every(
		( message: ZendeskMessage ) =>
			message.type !== 'form' &&
			message.metadata?.type !== 'csat' &&
			message.metadata?.type !== 'form' &&
			! message.metadata?.rated &&
			Date.now() - conversation.lastUpdatedAt * 1000 < AGE_THRESHOLD
	);
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
 * @returns The support interaction ID of the latest open conversation.
 */
export default function getMostRecentOpenLiveInteraction() {
	const conversations = getConversations();

	// They're already sorted by lastUpdatedAt, so we can just find the first one that's open.
	const latestOpenConversation = conversations.find( isOpenConversation );

	return ( latestOpenConversation?.metadata.supportInteractionId as string ) ?? null;
}

/**
 * Returns the number of currently open live conversations.
 */
export function getOpenLiveInteractionCount(): number {
	return getConversations().filter( isOpenConversation ).length;
}

/**
 * Returns true if the user has reached the maximum number of concurrent open conversations.
 */
export function hasReachedConversationLimit(): boolean {
	return getOpenLiveInteractionCount() >= MAX_OPEN_CONVERSATIONS;
}
