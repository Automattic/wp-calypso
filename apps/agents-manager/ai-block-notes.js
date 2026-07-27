/**
 * AI Block Notes Entry Point
 *
 * Entry point for the standalone AI Block Notes bundle.
 * Loaded on pages where AI Block Notes should be active (Block Editor, Post Editor, etc. )
 */
import './config';

/**
 * External dependencies
 */
import { initAiBlockNotes } from '@automattic/ai-block-notes';

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAiBlockNotes );
} else {
	initAiBlockNotes();
}
