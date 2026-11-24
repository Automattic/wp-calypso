import { isHappinessEngineerMessage } from './csat';
import type { Chat } from '../types';

export type ChatState = 'ai' | 'connecting' | 'waiting_for_agent' | 'with_agent';

/**
 * Who the user is talking to, for events: the AI, nobody yet while a person is being connected or
 * hasn't joined, or a person. Waiting lasts until the first Happiness Engineer message, since
 * automated messages, such as triggers and the move to email, arrive before anyone joins.
 */
export function getChatState( chat: Chat, isPendingDirectChat: boolean ): ChatState {
	if ( chat.provider?.startsWith( 'zendesk' ) ) {
		return chat.messages.some( isHappinessEngineerMessage ) ? 'with_agent' : 'waiting_for_agent';
	}

	return isPendingDirectChat || chat.status === 'transfer' ? 'connecting' : 'ai';
}
