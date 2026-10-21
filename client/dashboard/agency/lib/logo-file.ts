import { __ } from '@wordpress/i18n';

export const LOGO_REQUIRED_WIDTH = 800;
export const LOGO_REQUIRED_HEIGHT = 320;
export const LOGO_MAX_FILE_SIZE_MB = 10;
export const LOGO_ACCEPT = 'image/png, image/jpeg';

const DIMENSIONS_TOLERANCE = 5;
const MAX_FILE_SIZE_BYTES = LOGO_MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [ 'image/png', 'image/jpeg' ];

const getImageDimensions = ( file: File ): Promise< { width: number; height: number } > =>
	new Promise( ( resolve, reject ) => {
		const imageUrl = URL.createObjectURL( file );
		const image = new Image();

		image.onload = () => {
			resolve( { width: image.width, height: image.height } );
			URL.revokeObjectURL( imageUrl );
		};

		image.onerror = () => {
			reject( new Error( 'Unable to read image dimensions.' ) );
			URL.revokeObjectURL( imageUrl );
		};

		image.src = imageUrl;
	} );

/**
 * Checks an agency logo the way the API will: JPG or PNG, at most 10 MB, and
 * 800 by 320 pixels. Resolves to the message to show, or null when the file
 * is fine.
 */
export async function validateLogoFile( file: File ): Promise< string | null > {
	// The `accept` attribute is advisory: drag and drop bypasses it.
	if ( ! ALLOWED_MIME_TYPES.includes( file.type ) ) {
		return __( 'The image could not be read. Please use a valid JPG or PNG.' );
	}

	if ( file.size > MAX_FILE_SIZE_BYTES ) {
		return __( 'File is too large. Please upload a logo under 10 MB.' );
	}

	let dimensions;
	try {
		dimensions = await getImageDimensions( file );
	} catch {
		return __( 'The image could not be read. Please use a valid JPG or PNG.' );
	}

	if (
		Math.abs( dimensions.width - LOGO_REQUIRED_WIDTH ) > DIMENSIONS_TOLERANCE ||
		Math.abs( dimensions.height - LOGO_REQUIRED_HEIGHT ) > DIMENSIONS_TOLERANCE
	) {
		return __( 'Company logo must have 800px width and 320px height.' );
	}

	return null;
}
