// Thin wrappers around the agents-manager's public actions API
// (`window.__agentsManagerActions`). The actions object surfaces a few
// hundred ms after the dock mounts, and `submitChatMessage` attaches
// once the chat opens. Both are polled with the same bounded helper so
// a never-mounted dock can't hang the caller forever.

// Narrow shape we depend on; mirrors the full type in
// `packages/agents-manager/src/global.d.ts`.
declare global {
	interface Window {
		__agentsManagerActions?: {
			setChatOpen?: ( isOpen: boolean ) => void;
			submitChatMessage?: ( message?: string ) => Promise< void >;
		};
	}
}

const READY_TIMEOUT_MS = 10000;
const POLL_INTERVAL_MS = 50;

async function waitFor( predicate: () => boolean ): Promise< void > {
	if ( typeof window === 'undefined' || predicate() ) {
		return;
	}

	const deadline = Date.now() + READY_TIMEOUT_MS;
	while ( Date.now() < deadline ) {
		await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );

		if ( predicate() ) {
			return;
		}
	}
}

// Worst-case wait is `2 * READY_TIMEOUT_MS` (20s): once for `setChatOpen`
// to attach when the dock mounts, then once for `submitChatMessage` to
// attach after the chat opens. Both polls resolve immediately on the
// warm path.
export async function submitChatMessage( message: string ): Promise< void > {
	const trimmed = message.trim();

	if ( ! trimmed ) {
		return;
	}

	await waitFor( () => !! window.__agentsManagerActions?.setChatOpen );
	window.__agentsManagerActions?.setChatOpen?.( true );

	await waitFor( () => !! window.__agentsManagerActions?.submitChatMessage );
	await window.__agentsManagerActions?.submitChatMessage?.( trimmed );
}
