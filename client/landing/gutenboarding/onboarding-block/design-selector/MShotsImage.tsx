/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { loadmShotsPreview } from '../../../../lib/mshots';

const cacheMap: Map< string, string > = new Map();

const loadingImageURL = 'https://wordpress.com/mshots/v1/default/';

interface Props extends React.ImgHTMLAttributes< HTMLImageElement > {
	siteUrl: string;
}

export const MShotsImage: React.FunctionComponent< Props > = ( { siteUrl, ...rest } ) => {
	const [ imageUrl, setImageUrl ] = React.useState< string >( loadingImageURL );

	React.useEffect( () => {
		async function fetchImage() {
			// fetch the image
			const loadedImageUrl = await loadmShotsPreview( {
				url: siteUrl,
			} );

			// cache the image
			cacheMap.set( siteUrl, loadedImageUrl );

			setImageUrl( loadedImageUrl );
		}
		// check if the image is cached
		if ( cacheMap.has( siteUrl ) ) {
			setImageUrl( cacheMap.get( siteUrl ) as string );
		} else {
			fetchImage();
		}
	}, [ siteUrl ] );

	// eslint-disable-next-line jsx-a11y/alt-text
	return <img src={ imageUrl } { ...rest } />;
};
