import { isHappinessEngineerMessage } from './csat';
import type { Chat } from '../types';

export type ChatState = 'ai' | 'not_started' | 'connecting' | 'waiting_for_agent' | 'with_agent';

interface PendingDirectChat {
	/** A chat that goes straight to a person hasn't reached the person yet. */
	isPendingDirectChat: boolean;
	/** That chat starts on the user's first message and hasn't had one. */
	isWaitingForFirstMessage: boolean;
}

/**
 * Who the user is talking to, for events: the AI, nobody yet, or a person. Nobody yet covers a chat
 * with a person that hasn't started because it waits for the user's first message, one being
 * connected, and one a person hasn't joined. Waiting lasts until the first Happiness Engineer
 * message, since automated messages, such as triggers and the move to email, arrive before anyone
 * joins.
 */
export function getChatState(
	chat: Chat,
	{ isPendingDirectChat, isWaitingForFirstMessage }: PendingDirectChat
): ChatState {
	if ( chat.provider?.startsWith( 'zendesk' ) ) {
		return chat.messages.some( isHappinessEngineerMessage ) ? 'with_agent' : 'waiting_for_agent';
	}

	// Once the first message is sent, the chat is connecting, though it's still waiting on paper.
	if ( isWaitingForFirstMessage && chat.status !== 'transfer' ) {
		return 'not_started';
	}

	return isPendingDirectChat || chat.status === 'transfer' ? 'connecting' : 'ai';
}
