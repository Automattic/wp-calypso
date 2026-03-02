import { getBlogId } from '../agent-config';

/**
 * Generate a deterministic session ID for a block note thread using SHA-256 hash.
 *
 * This creates a hashed identifier that:
 * - Is deterministic and consistent across the thread
 * - Includes blogId, postId, and noteId for uniqueness across sites and threads
 * @param {number | undefined} postId - The post ID containing the note thread
 * @param {number}             noteId - Root note ID
 * @returns {Promise<string | undefined>} A hashed session ID, or undefined if params are invalid or hashing fails
 */
export async function getBlockNoteThreadSessionId(
	postId: number | undefined,
	noteId: number
): Promise< string | undefined > {
	const blogId = getBlogId();
	if ( ! blogId || ! postId || ! noteId ) {
		window.console?.warn( 'Block Notes: Missing required parameters for session ID generation', {
			blogId: !! blogId,
			postId: !! postId,
			noteId: !! noteId,
		} );
		return undefined;
	}

	try {
		// Create input string with all required parameters
		const input = `block-note-${ blogId }-${ postId }-${ noteId }`;

		const encoder = new TextEncoder();
		const data = encoder.encode( input );
		const hashBuffer = await crypto.subtle.digest( 'SHA-256', data );

		// Convert to hex string
		const hashArray = Array.from( new Uint8Array( hashBuffer ) );
		const hashHex = hashArray.map( ( byte ) => byte.toString( 16 ).padStart( 2, '0' ) ).join( '' );

		// Take first 32 characters and format as UUID-like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
		return `${ hashHex.slice( 0, 8 ) }-${ hashHex.slice( 8, 12 ) }-${ hashHex.slice(
			12,
			16
		) }-${ hashHex.slice( 16, 20 ) }-${ hashHex.slice( 20, 32 ) }`;
	} catch ( error ) {
		window.console?.error(
			'Block Notes: Failed to generate session ID - crypto operation failed',
			error
		);
		return undefined;
	}
}
