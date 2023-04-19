import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { LANDSCAPE_MODE, PORTRAIT_MODE } from '../../constants';
import type { ImageMode } from '../../types';

type ImageEventHandler = ( event: React.SyntheticEvent< HTMLImageElement > ) => void;
type ImgProps = {
	alt: string;
	onLoad: ImageEventHandler;
	onError: ImageEventHandler;
};
type UseImage = ( mode?: ImageMode ) => [ ImageMode | undefined, boolean, ImgProps ];

const useImage: UseImage = ( initialMode ) => {
	const [ mode, setMode ] = useState< ImageMode | undefined >( initialMode );
	const [ isLoadingImage, setLoadingImage ] = useState< boolean >( true );

	const onLoad = useCallback(
		( { target } ) => {
			if ( ! mode ) {
				setMode( target.naturalWidth > target.naturalHeight ? LANDSCAPE_MODE : PORTRAIT_MODE );
			}
			setLoadingImage( false );
		},
		[ mode ]
	);
	const onError = useCallback( () => setLoadingImage( false ), [] );

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
