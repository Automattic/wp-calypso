import type { BigSkyMessage } from '../types';
import type { UIMessage } from '@automattic/agenttic-client';

/** Converts a message a provider adds through `addMessage` to Agenttic's format. */
export function convertBigSkyMessageToUIMessage( message: BigSkyMessage ): UIMessage {
	return {
		// Spread first to keep fields `BigSkyMessage` doesn't declare, e.g. the
		// `context` the site build reads to show its progress indicator.
		...message,
		role: message.role === 'assistant' ? 'agent' : 'user',
		timestamp: message.created_at ? message.created_at * 1000 : Date.now(),
		archived: message.archived ?? false,
		showIcon: message.showIcon ?? true,
	} as UIMessage;
}
