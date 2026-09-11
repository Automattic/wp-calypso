import type { UIMessage } from '@automattic/agenttic-client';

/**
 * Whether a message only carries context for the agent (e.g. a navigation
 * continuation) and is never rendered as part of the conversation. The server's
 * context flag reaches the client already normalised into a `context` part.
 */
export function isContextOnlyMessage( message: UIMessage ): boolean {
	return Boolean(
		message.content?.some( ( content ) => {
			if ( content.type === 'context' ) {
				return true;
			}

			const flags =
				content.type === 'data' ? ( content.data?.flags as { context_only?: boolean } ) : undefined;
			return flags?.context_only === true;
		} )
	);
}
