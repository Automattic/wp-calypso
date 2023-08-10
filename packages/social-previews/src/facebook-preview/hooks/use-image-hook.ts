import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { LANDSCAPE_MODE, PORTRAIT_MODE } from '../../constants';
import type { ImageMode } from '../types';

type ImageEventHandler = ( event: React.SyntheticEvent< HTMLImageElement > ) => void;
type ImgProps = {
	alt: string;
	onLoad: ImageEventHandler;
	onError: ImageEventHandler;
};
type UseImage = ( arg0: { mode?: ImageMode } ) => [ ImageMode | undefined, boolean, ImgProps ];

const useImage: UseImage = ( { mode: initialMode } ) => {
	const [ mode, setMode ] = useState< ImageMode | undefined >( initialMode );
	const [ isLoadingImage, setLoadingImage ] = useState< boolean >( true );

	const onLoad = useCallback< ImageEventHandler >(
		( { target } ) => {
			if ( ! mode ) {
				const image = target as HTMLImageElement;
				setMode( image.naturalWidth > image.naturalHeight ? LANDSCAPE_MODE : PORTRAIT_MODE );
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
			alt: __( 'Facebook Preview Thumbnail', 'social-previews' ),
			onLoad,
			onError,
		},
	];
};

export default useImage;
