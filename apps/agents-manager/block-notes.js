/**
 * Block Notes Entry Point
 *
 * Entry point for the standalone Block Notes bundle.
 * Loaded on pages where Block Notes should be active (Block Editor, Post Editor, etc. )
 */

/**
 * External dependencies
 */
import { initBlockNotes } from '@automattic/block-notes';

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initBlockNotes );
} else {
	initBlockNotes();
}
