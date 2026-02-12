/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';

/**
 * Custom hook to handle image URL conversion and cleanup
 *
 * Converts File objects to blob URLs and handles cleanup to prevent memory leaks.
 * @param {File | string | null} image - The image as a File object or URL string
 * @returns {string | null} The URL string to use for the image src
 */
export function useImageUrl( image: File | string | null ): string | null {
	const [ url, setUrl ] = useState< string | null >( null );

	useEffect( () => {
		if ( ! image ) {
			setUrl( null );
			return;
		}

		if ( typeof image === 'string' ) {
			setUrl( image );
			return;
		}

		if ( image instanceof File ) {
			const blobUrl = URL.createObjectURL( image );
			setUrl( blobUrl );

			// Cleanup function to revoke blob URL on unmount or when image changes
			return () => {
				URL.revokeObjectURL( blobUrl );
			};
		}
	}, [ image ] );

	return url;
}
