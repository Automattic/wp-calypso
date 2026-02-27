/**
 * Block Notes Entry Point
 *
 * Exports the initBlockNotes function which initializes the Block Notes feature.
 * Initialization is triggered by the entry point (apps/agents-manager/block-notes.js),
 */

import { createRoot, StrictMode } from '@wordpress/element';
import BlockNoteSubscriptions from './components/subscriptions';
import { areBlockNotesEnabled } from './utils/feature-flag';

export function initBlockNotes(): void {
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
