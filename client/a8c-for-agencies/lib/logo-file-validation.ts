export const A4A_LOGO_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const A4A_LOGO_REQUIRED_WIDTH = 800;
export const A4A_LOGO_REQUIRED_HEIGHT = 320;
export const A4A_LOGO_DIMENSIONS_TOLERANCE = 5;

export const REFERRAL_CHECKOUT_LOGO_ALLOWED_MIME_TYPES = [ 'image/png', 'image/jpeg' ];

export type LogoFileValidationError = 'format' | 'size';

type ValidateLogoFileOptions = {
	allowedMimeTypes: string[];
	maxFileSizeBytes?: number;
};

export const getAcceptMimeTypes = ( mimeTypes: string[] ) => mimeTypes.join( ',' );

export const validateLogoFile = (
	file: File,
	{ allowedMimeTypes, maxFileSizeBytes = A4A_LOGO_MAX_FILE_SIZE_BYTES }: ValidateLogoFileOptions
): LogoFileValidationError | null => {
	if ( ! allowedMimeTypes.includes( file.type ) ) {
		return 'format';
	}

	if ( file.size > maxFileSizeBytes ) {
		return 'size';
	}

	return null;
};

type ValidateLogoDimensionsOptions = {
	requiredWidth: number;
	requiredHeight: number;
	tolerance?: number;
};

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

export const validateLogoDimensions = async (
	file: File,
	{
		requiredWidth,
		requiredHeight,
		tolerance = A4A_LOGO_DIMENSIONS_TOLERANCE,
	}: ValidateLogoDimensionsOptions
): Promise< boolean > => {
	const { width, height } = await getImageDimensions( file );
	return (
		Math.abs( width - requiredWidth ) <= tolerance &&
		Math.abs( height - requiredHeight ) <= tolerance
	);
};
