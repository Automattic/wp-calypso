import { useEffect, useState } from 'react';
import { getMshotUrl, MSHOT_PLACEHOLDER, MSHOT_TRIES } from './torn-collage';

/** The address of the site's screenshot, once mShots has finished taking it. */
export function useMshotImage( url: string ) {
	const [ imageUrl, setImageUrl ] = useState< string >();

	useEffect( () => {
		let retry: number | undefined;
		let attempt = 0;
		const image = new Image();
		image.onload = () => {
			const isPlaceholder =
				image.naturalWidth === MSHOT_PLACEHOLDER.width &&
				image.naturalHeight === MSHOT_PLACEHOLDER.height;
			if ( ! isPlaceholder ) {
				setImageUrl( image.src );
			} else if ( attempt < MSHOT_TRIES ) {
				attempt++;
				retry = window.setTimeout( () => {
					image.src = getMshotUrl( url, attempt );
				}, attempt * 1000 );
			}
		};
		image.src = getMshotUrl( url );

		return () => {
			image.onload = null;
			clearTimeout( retry );
		};
	}, [ url ] );

	return imageUrl;
}
