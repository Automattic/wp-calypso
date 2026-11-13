import type { PromptSource } from '@automattic/agenttic-client';

/**
 * Where the next send's prompt comes from, declared by the host UI before the
 * composer dispatches it (a checklist item's `action` runs before the submit
 * path). Claimed for one exact prompt, so a click whose send was blocked never
 * labels a message the user types later, and consumed by the one send it was
 * meant for. The composer passes it on as `SubmitOptions.promptSource`, which
 * keeps it on the message and sends it to the server with the client context.
 */
let pending: { promptSource: PromptSource; prompt: string } | null = null;

type DispatchListener = ( promptSource: PromptSource ) => void;

// Told of every source a send consumed: the host records a pick from the prompt
// the composer dispatched, not from the click. Lives as long as `pending` (the
// page); each subscriber unsubscribes on unmount.
const dispatchListeners = new Set< DispatchListener >();

export function markNextPromptSource( promptSource: PromptSource, prompt: string ): void {
	pending = { promptSource, prompt: prompt.trim() };
}

/** Called as a send starts: the pending source applies only to its own prompt, once. */
export function consumePromptSource( message: string ): PromptSource | undefined {
	const match = pending && pending.prompt === message.trim() ? pending.promptSource : undefined;
	pending = null;
	if ( match ) {
		dispatchListeners.forEach( ( listener ) => listener( match ) );
	}
	return match;
}

/** Hears the source of every dispatched send; returns the unsubscribe. */
export function subscribeToDispatchedPromptSources( listener: DispatchListener ): () => void {
	dispatchListeners.add( listener );
	return () => {
		dispatchListeners.delete( listener );
	};
}
