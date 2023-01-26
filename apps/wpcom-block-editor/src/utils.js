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
 * @param {Object} message object containing the action to be performed on the parent and any require options
 */
export function sendMessage( message ) {
	if ( ! window || ! window.parent ) {
		return;
	}

	window.parent.postMessage( { ...message, type: 'gutenbergIframeMessage' }, '*' );
}

/**
 * Indicates if the block editor has been initialized.
 *
 * @returns {Promise} Promise that resolves when the editor has been initialized.
 */
export const isEditorReady = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			// Calypso sends the message as soon as the iframe is loaded, so we
			// need to be sure that the editor is initialized and the core blocks
			// registered. There is an unstable selector for that, so we use
			// `isCleanNewPost` otherwise which is triggered when everything is
			// initialized if the post is new.
			const editorIsReady = select( 'core/editor' ).__unstableIsEditorReady
				? select( 'core/editor' ).__unstableIsEditorReady()
				: select( 'core/editor' ).isCleanNewPost();
			if ( editorIsReady ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

/**
 * Indicates if the block editor has been initialized with blocks.
 *
 * @returns {Promise} Promise that resolves when the editor has been initialized with blocks.
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

export const getPages = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const pages = select( 'core' ).getEntityRecords( 'postType', 'page', { per_page: -1 } );

			if ( pages !== null ) {
				unsubscribe();
				resolve( pages );
			}
		} );
	} );

// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT = 'wp-e2e-tests';

export const isE2ETest = () =>
	typeof window !== 'undefined' && window.navigator.userAgent.includes( E2E_USER_AGENT );
