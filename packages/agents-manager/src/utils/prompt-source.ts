/**
 * Where a send's prompt came from, declared in `clientContext.metadata.promptSource`
 * (distinct from `metadata.source`, which names the calling client). The server
 * stores it on the user message and returns it with the conversation. It is
 * claimed for one exact prompt, so a click whose send was blocked never labels
 * a message the user types later, and it is cleared once that send is over.
 */
let pending: { promptSource: string; prompt: string } | null = null;
let active: string | null = null;

/** Declare the source of the next send of `prompt`. */
export function markNextPromptSource( promptSource: string, prompt: string ): void {
	pending = { promptSource, prompt: prompt.trim() };
}

/** Called as a send starts: the pending source applies only to its own prompt. */
export function takePromptSource( message: string ): void {
	active = pending && pending.prompt === message.trim() ? pending.promptSource : null;
	pending = null;
}

/** The prompt source of the send in flight, read while the client context is built. */
export function getPromptSource(): string | null {
	return active;
}

export function clearPromptSource(): void {
	active = null;
}
