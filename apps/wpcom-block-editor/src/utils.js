/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { select, subscribe } from '@wordpress/data';

/**
 * Checks self and top to determine if we are being loaded in an iframe.
 * Can't use window.frameElement because we are being embedded from a different origin.
 *
 * @returns {boolean} Whether this script is loaded in a iframe.
 */
export function inIframe() {
	try {
		return window.self !== window.top;
	} catch ( e ) {
		return true;
	}
}

/**
 * Sends a message object to the parent. The object is extended to include a type that
 * identifies the source as Gutenberg related.
 *
 * @param {object} message object containing the action to be performed on the parent and any require options
 */
export function sendMessage( message ) {
	if ( ! window || ! window.parent ) {
		return;
	}

	window.parent.postMessage( { ...message, type: 'gutenbergIframeMessage' }, '*' );
}

/**
 * Indicates if the block editor has been initialized with blocks.
 *
 * @returns {Promise} Promise that resolves when the editor has been initialized.
 */
export const isEditorReadyWithBlocks = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const isCleanNewPost = select( 'core/editor' ).isCleanNewPost();

			if ( isCleanNewPost ) {
				unsubscribe();
				resolve( false );
			}

			const blocks = select( 'core/editor' ).getBlocks();

			if ( blocks.length > 0 ) {
				unsubscribe();
				resolve( true );
			}
		} );
	} );
