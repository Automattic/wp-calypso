import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AImagePicker from 'calypso/a8c-for-agencies/components/a4a-image-picker';
import {
	A4A_LOGO_REQUIRED_HEIGHT,
	A4A_LOGO_REQUIRED_WIDTH,
	validateLogoDimensions,
} from 'calypso/a8c-for-agencies/lib/logo-file-validation';

type Props = {
	logo?: string | null;
	onPick?: ( url: string ) => void;
};

const LogoPicker = ( { logo, onPick }: Props ) => {
	const translate = useTranslate();

	const [ error, setError ] = useState< string | null >( null );

	const onImagePick = async ( file: File ) => {
		setError( null );

		const isValidDimensions = await validateLogoDimensions( file, {
			requiredWidth: A4A_LOGO_REQUIRED_WIDTH,
			requiredHeight: A4A_LOGO_REQUIRED_HEIGHT,
		} );

		if ( ! isValidDimensions ) {
			setError( translate( 'Company logo must have 800px width and 320px height.' ) );
			return;
		}

		onPick?.( URL.createObjectURL( file ) );
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
