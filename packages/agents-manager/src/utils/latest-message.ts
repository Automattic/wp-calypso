import { isContextOnlyMessage } from './context-only-message';
import { isCreditsCommandMessageId } from './credits-command';
import type { UIMessage } from '@automattic/agenttic-client';

/**
 * The latest reply a turn produced, which skips the browser's own `/credits` answer: it has no
 * turn behind it, so counting it would stop the real reply from being regenerated.
 */
export function getLatestAgentMessageId( messages: UIMessage[] ): string | null {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if (
			messages[ index ].role === 'agent' &&
			! isCreditsCommandMessageId( messages[ index ].id )
		) {
			return messages[ index ].id;
		}
	}

	return null;
}

/**
 * Index of the latest message the user typed, skipping context-only messages and the UI-only
 * ones the browser adds itself, such as the `/credits` question, which no turn answers.
 */
export function getLatestUserMessageIndex( messages: UIMessage[] ): number {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		if (
			messages[ index ].role === 'user' &&
			! messages[ index ].isUiOnly &&
			! isContextOnlyMessage( messages[ index ] )
		) {
			return index;
		}
	}

	return -1;
}
