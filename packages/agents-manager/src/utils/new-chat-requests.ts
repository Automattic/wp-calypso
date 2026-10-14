import type { NavigateFunction } from 'react-router-dom';

/**
 * New chats a host has asked for and is waiting on.
 *
 * A host that swaps what the chat is about (a fresh redesign run) must not hand
 * the new subject to the old conversation, so it needs to know when the old one
 * is gone, not merely that a navigation was requested. The request rides the
 * ordinary new-chat route state, and `AgentSetup` settles it once it has
 * aborted and removed the old agent and cleared the stored session.
 */
const pendingNewChats = new Map< string, () => void >();
let lastRequestId = 0;

/**
 * Start a new chat through the native new-chat route.
 * @param navigate The chat router's navigate function.
 * @returns Resolves once the previous conversation has been discarded.
 */
export function requestNewChat( navigate: NavigateFunction ): Promise< void > {
	const newChatRequestId = `new-chat-${ ++lastRequestId }`;
	return new Promise( ( resolve ) => {
		pendingNewChats.set( newChatRequestId, resolve );
		navigate( '/chat', { state: { isNewChat: true, newChatRequestId }, replace: true } );
	} );
}

/**
 * Settle a request once its new chat has replaced the previous conversation.
 * @param newChatRequestId The id from the route state, if the new chat was requested.
 */
export function settleNewChatRequest( newChatRequestId: unknown ): void {
	if ( typeof newChatRequestId !== 'string' ) {
		return;
	}
	const resolve = pendingNewChats.get( newChatRequestId );
	pendingNewChats.delete( newChatRequestId );
	resolve?.();
}
