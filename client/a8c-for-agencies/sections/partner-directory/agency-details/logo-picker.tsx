import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AImagePicker from 'calypso/a8c-for-agencies/components/a4a-image-picker';

const LOGO_SIZE_WIDTH = 800;
const LOGO_SIZE_HEIGHT = 320;
const LOGO_SIZE_TOLERANCE = 5;

type Props = {
	logo?: string | null;
	onPick?: ( url: string ) => void;
};

const getImage = ( file: File ): Promise< HTMLImageElement > => {
	return new Promise( ( resolve ) => {
		const reader = new FileReader();

		reader.onload = function () {
			const img = new Image();

			img.onload = function () {
				resolve( img );
			};

			img.src = ( reader.result as string ) ?? '';
		};

		reader.readAsDataURL( file );
	} );
};

const LogoPicker = ( { logo, onPick }: Props ) => {
	const translate = useTranslate();

	const [ error, setError ] = useState< string | null >( null );

	const onImagePick = ( file: File ) => {
		setError( null );

		getImage( file ).then( ( img ) => {
			// Check against the allowed deviation in pixels from the required logo dimensions
			const isWidthValid = Math.abs( img.width - LOGO_SIZE_WIDTH ) <= LOGO_SIZE_TOLERANCE;
			const isHeightValid = Math.abs( img.height - LOGO_SIZE_HEIGHT ) <= LOGO_SIZE_TOLERANCE;

			if ( ! isWidthValid || ! isHeightValid ) {
				setError( translate( 'Company logo must have 800px width and 320px height.' ) );
				return;
			}

			onPick?.( URL.createObjectURL( file ) );
		} );
	};

	return (
		<A4AImagePicker
			className="partner-directory__logo-picker"
			image={ logo }
			onPick={ onImagePick }
			error={ error }
		/>
	);
};

export default LogoPicker;
