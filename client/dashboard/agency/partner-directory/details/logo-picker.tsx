import { Button, FormFileUpload, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Text } from '../../../components/text';

const REQUIRED_WIDTH = 800;
const REQUIRED_HEIGHT = 320;
const DIMENSIONS_TOLERANCE = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
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

interface LogoPickerProps {
	logo?: string | null;
	onPick: ( file: File ) => void;
}

/**
 * Picks the agency logo. The picked file stays local until the form is saved,
 * which uploads it.
 */
export default function LogoPicker( { logo, onPick }: LogoPickerProps ) {
	const [ error, setError ] = useState< string | null >( null );

	const onFilePick = async ( file?: File ) => {
		if ( ! file ) {
			return;
		}

		setError( null );

		// The `accept` attribute is advisory: drag and drop bypasses it.
		if ( ! ALLOWED_MIME_TYPES.includes( file.type ) ) {
			setError( __( 'The image could not be read. Please use a valid JPG or PNG.' ) );
			return;
		}

		if ( file.size > MAX_FILE_SIZE_BYTES ) {
			setError( __( 'File is too large. Please upload a logo under 10 MB.' ) );
			return;
		}

		let dimensions;
		try {
			dimensions = await getImageDimensions( file );
		} catch {
			setError( __( 'The image could not be read. Please use a valid JPG or PNG.' ) );
			return;
		}

		if (
			Math.abs( dimensions.width - REQUIRED_WIDTH ) > DIMENSIONS_TOLERANCE ||
			Math.abs( dimensions.height - REQUIRED_HEIGHT ) > DIMENSIONS_TOLERANCE
		) {
			setError( __( 'Company logo must have 800px width and 320px height.' ) );
			return;
		}

		onPick( file );
	};

	return (
		<VStack spacing={ 2 } alignment="flex-start">
			{ logo && (
				<img
					src={ logo }
					alt={ __( 'Agency logo' ) }
					style={ { maxWidth: '100%', width: '400px' } }
				/>
			) }
			<FormFileUpload
				accept="image/png, image/jpeg"
				onChange={ ( event ) => {
					onFilePick( event.currentTarget.files?.[ 0 ] );
					// Allow re-picking the same file after a failed validation.
					event.currentTarget.value = '';
				} }
				render={ ( { openFileDialog } ) => (
					<Button __next40pxDefaultSize variant="secondary" onClick={ openFileDialog }>
						{ logo ? __( 'Upload new image' ) : __( 'Upload image' ) }
					</Button>
				) }
			/>
			{ error && <Text intent="error">{ error }</Text> }
		</VStack>
	);
}
