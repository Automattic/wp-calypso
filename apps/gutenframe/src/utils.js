/**
 * Checks self and top to determine if we are being loaded in an iframe.
 * Can't use window.frameElement because we are being embedded from a different origin.
 *
 * @return {Boolean} Whether this script is loaded in a iframe.
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
