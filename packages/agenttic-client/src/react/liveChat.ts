import type { AgentChatState, MessageActionsRegistration } from './useAgentChat';
import type { SetStateAction } from 'react';

/**
 * A chat's state and send lock, kept outside its component so a send can outlive it.
 */
export interface LiveChat {
	state: AgentChatState;
	listeners: Set< () => void >;
	/** Guards against concurrent sends racing on `conversationHistory`. */
	isSending: boolean;
	registrations: MessageActionsRegistration[];
}

const INITIAL_STATE: AgentChatState = {
	clientMessages: [],
	uiMessages: [],
	isProcessing: false,
	error: null,
	suggestions: [],
	progressMessage: null,
	progressPhase: null,
	isReplying: false,
};

// The chats that set `resumeOnRemount`, by agent id.
const resumableChats = new Map< string, LiveChat >();

/** Creates a chat. One that replaces `previous` takes over its subscribers. */
export function createLiveChat( previous?: LiveChat ): LiveChat {
	return {
		// A new object, so subscribers of `previous` render the new chat.
		state: { ...INITIAL_STATE },
		listeners: previous?.listeners ?? new Set(),
		isSending: false,
		registrations: [],
	};
}

/** The chat of a resumable agent, kept until the agent is removed. */
export function getResumableChat( agentId: string ): LiveChat {
	let liveChat = resumableChats.get( agentId );

	if ( ! liveChat ) {
		liveChat = createLiveChat();
		resumableChats.set( agentId, liveChat );
	}

	return liveChat;
}

/**
 * Ends a removed agent's chat. The next agent gets a new one, out of reach of a
 * send the old agent is still unwinding.
 */
export function endResumableChat( agentId: string ): void {
	const previous = resumableChats.get( agentId );

	if ( ! previous ) {
		return;
	}

	const liveChat = createLiveChat( previous );

	resumableChats.set( agentId, liveChat );
	previous.listeners = new Set();

	liveChat.listeners.forEach( ( listener ) => listener() );
}

/** Sets the chat's state and tells its subscribers. */
export function updateLiveChat(
	liveChat: LiveChat,
	update: SetStateAction< AgentChatState >
): void {
	const next = typeof update === 'function' ? update( liveChat.state ) : update;

	if ( next !== liveChat.state ) {
		liveChat.state = next;
		liveChat.listeners.forEach( ( listener ) => listener() );
	}
}
