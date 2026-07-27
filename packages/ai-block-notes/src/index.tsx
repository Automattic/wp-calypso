/**
 * AI Block Notes Entry Point
 *
 * Exports the initAiBlockNotes function which initializes AI Block Notes.
 * Initialization is triggered by the entry point (apps/agents-manager/ai-block-notes.js),
 */

import { createRoot, StrictMode } from '@wordpress/element';
import AiBlockNotesSubscriptions from './components/subscriptions';
import { isAiBlockNotesEnabled } from './utils/feature-flag';

export function initAiBlockNotes(): void {
	if ( ! isAiBlockNotesEnabled() ) {
		return;
	}

	let container = document.getElementById( 'ai-block-notes-root' );
	if ( ! container ) {
		container = document.createElement( 'div' );
		container.id = 'ai-block-notes-root';
		document.body.appendChild( container );
	}

	const root = createRoot( container );
	root.render(
		<StrictMode>
			<AiBlockNotesSubscriptions />
		</StrictMode>
	);
}
