import { Button, FormFileUpload, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Text } from '../../../components/text';
import { LOGO_ACCEPT, validateLogoFile } from '../../lib/logo-file';

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

		const validationError = await validateLogoFile( file );
		setError( validationError );
		if ( ! validationError ) {
			onPick( file );
		}
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
				accept={ LOGO_ACCEPT }
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
