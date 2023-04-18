import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { LANDSCAPE_MODE, PORTRAIT_MODE } from '../../constants';

type Mode = typeof LANDSCAPE_MODE | typeof PORTRAIT_MODE | undefined;
type ImageEventHandler = ( event: React.SyntheticEvent< HTMLImageElement > ) => void;
type ImgProps = {
	alt: string;
	onLoad: ImageEventHandler;
	onError: ImageEventHandler;
};
type UseImage = () => [ Mode, boolean, ImgProps ];

const useImage: UseImage = () => {
	const [ mode, setMode ] = useState< typeof LANDSCAPE_MODE | typeof PORTRAIT_MODE | undefined >();
	const [ isLoadingImage, setLoadingImage ] = useState< boolean >( true );

	const onLoad = useCallback(
		( { target } ) => {
			setMode( target.naturalWidth > target.naturalHeight ? LANDSCAPE_MODE : PORTRAIT_MODE );
			setLoadingImage( false );
		},
		[ setMode, setLoadingImage ]
	);
	const onError = useCallback( () => setLoadingImage( false ), [ setLoadingImage ] );

	return [
		mode,
		isLoadingImage,
		{
			alt: __( 'Facebook Preview Thumbnail', 'facebook-preview' ),
			onLoad,
			onError,
		},
	];
};

export default useImage;
