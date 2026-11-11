/**
 * Stands in for `@automattic/zendesk-client` in the reader chat build. Reader
 * Chat never escalates to Zendesk, so this keeps the client and Smooch off blog
 * pages. The empty list is shared, so memoized callers stay stable.
 */

const EMPTY_CONVERSATIONS = Object.freeze( [] );

export function useGetZendeskConversations() {
	return { conversations: EMPTY_CONVERSATIONS, isLoading: false };
}
