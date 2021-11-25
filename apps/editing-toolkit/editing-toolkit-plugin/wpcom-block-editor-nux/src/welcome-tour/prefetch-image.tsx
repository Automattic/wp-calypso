/**
 * External dependencies
 */
import React, { useEffect } from 'react';
/**
 * Internal dependencies
 */
import { useImageSrcForView } from './utils';
import type { TourAsset } from './types';
interface Props {
	asset: TourAsset;
}

const PrefetchImage: React.FunctionComponent< Props > = ( { asset } ) => {
	const imgSrc = useImageSrcForView( asset );
	useEffect( () => {
		new window.Image().src = imgSrc;
	}, [ imgSrc ] );

	return null;
};

export default PrefetchImage;
