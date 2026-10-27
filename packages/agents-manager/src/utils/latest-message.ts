import { isContextOnlyMessage } from './context-only-message';
import type { UIMessage } from '@automattic/agenttic-client';

export function getLatestAgentMessageId( messages: UIMessage[] ): string | null {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if ( messages[ index ].role === 'agent' ) {
			return messages[ index ].id;
		}
	}

	return null;
}

/** Index of the latest message the user typed, skipping context-only messages. */
export function getLatestUserMessageIndex( messages: UIMessage[] ): number {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if ( messages[ index ].role === 'user' && ! isContextOnlyMessage( messages[ index ] ) ) {
			return index;
		}
	}

	return -1;
}
