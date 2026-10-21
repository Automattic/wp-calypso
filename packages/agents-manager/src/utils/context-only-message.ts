import type { UIMessage } from '@automattic/agenttic-client';

interface MessageWithContextFlags extends UIMessage {
	context?: {
		flags?: {
			context_only?: boolean;
		};
	};
}

/** Whether a message is hidden context for the model, not one the user sent. */
export function isContextOnlyMessage( message: UIMessage ): boolean {
	return (
		( message as MessageWithContextFlags ).context?.flags?.context_only === true ||
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
