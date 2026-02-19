/**
 * Block Notes Entry Point
 *
 * Self-initializing entry point for Block Notes feature.
 * Creates its own DOM container and React root, matching Image Studio's pattern.
 *
 * Abilities are registered by the headless orchestrator (via registerAbilities()),
 * not here — following Image Studio's pattern where abilities live in the shared registry.
 */

import { createRoot, StrictMode } from '@wordpress/element';
import BlockNoteSubscriptions from './components/subscriptions';
import { areBlockNotesEnabled } from './utils/feature-flag';

function initBlockNotes(): void {
	if ( ! areBlockNotesEnabled() ) {
		return;
	}

	let container = document.getElementById( 'big-sky-block-notes-root' );
	if ( ! container ) {
		container = document.createElement( 'div' );
		container.id = 'big-sky-block-notes-root';
		document.body.appendChild( container );
	}

	const root = createRoot( container );
	root.render(
		<StrictMode>
			<BlockNoteSubscriptions />
		</StrictMode>
	);
}

// Initialize when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initBlockNotes );
} else {
	initBlockNotes();
}
