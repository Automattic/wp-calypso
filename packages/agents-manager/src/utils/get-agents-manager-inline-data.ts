// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// Ambient declaration files cannot be `import`ed; a triple-slash reference is required to ensure
// the global is visible when TypeScript resolves this file via the import graph rather than the
// tsconfig include list (e.g. during sandbox / CI builds).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

/**
 * Read the server-injected Agents Manager inline payload.
 *
 * Jetpack's Agents Manager feature injects a bare `const agentsManagerData` global
 * rather than a `window` property. Embedded hosts (reader-chat, Plugin Compass)
 * may assign `window.agentsManagerData` instead. Read the bare global first and
 * fall back to `window.agentsManagerData`.
 *
 * Safe in SSR — returns `undefined` when `window` is unavailable.
 */
export function getAgentsManagerInlineData(): typeof agentsManagerData {
	if ( typeof agentsManagerData !== 'undefined' && agentsManagerData ) {
		return agentsManagerData;
	}

	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	return ( window as { agentsManagerData?: typeof agentsManagerData } ).agentsManagerData;
}
