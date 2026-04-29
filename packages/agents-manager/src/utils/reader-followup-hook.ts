// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// Ambient declaration files cannot be `import`ed; a triple-slash reference is required to ensure
// the global is visible when TypeScript resolves this file via the import graph rather than the
// tsconfig include list (e.g. during sandbox / CI builds).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />
/**
 * Reader-chat follow-up suggestions bridge.
 *
 * `reader-chat.js` (the frontend entry) sets `window.__jetpackReaderFollowupChips`
 * and dispatches `reader-chat-followups-updated` after each agent reply. This
 * hook reads both using the AgentsManager package's own React instance —
 * critical, because cross-bundle React hooks don't share state — so the
 * suggestion strip re-renders when chips arrive.
 */

import { useState, useEffect } from '@wordpress/element';
import type { Suggestion } from '../types';
import type { UseSuggestionsHook } from './load-external-providers';

type FollowupWindow = Window & { __jetpackReaderFollowupChips?: Suggestion[] };

function readChips(): Suggestion[] {
	if ( typeof window === 'undefined' ) {
		return [];
	}
	const chips = ( window as FollowupWindow ).__jetpackReaderFollowupChips;
	return Array.isArray( chips ) ? chips : [];
}

export const useReaderFollowupSuggestions: UseSuggestionsHook = () => {
	const [ chips, setChips ] = useState< Suggestion[] >( readChips );
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		const handler = () => setChips( readChips() );
		window.addEventListener( 'reader-chat-followups-updated', handler );
		return () => window.removeEventListener( 'reader-chat-followups-updated', handler );
	}, [] );
	return { suggestions: chips };
};
