import { useEffect, useState } from 'react';
import { getMshotUrl, MSHOT_PLACEHOLDER, MSHOT_TRIES } from './torn-collage';

import './colliding-cards.scss';

/** The address of the site's screenshot, once mShots has finished taking it. */
function useMshotImage( url: string ) {
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

/**
 * Two cards taking turns to swing out and strike each other, like a Newton's cradle. Each hit
 * slides the site's screenshot across the line between them, with one card winning it gradually.
 */
export function CollidingCards( { imageUrl }: { imageUrl?: string } ) {
	return (
		<div className="static-site-import-colliding-cards" aria-hidden="true">
			{ [ 'is-left', 'is-right' ].map( ( side ) => (
				<div key={ side } className={ `static-site-import-colliding-cards__card ${ side }` }>
					{ imageUrl && (
						<img className="static-site-import-colliding-cards__image" src={ imageUrl } alt="" />
					) }
				</div>
			) ) }
		</div>
	);
}

export function CollidingCardsPreview( { url }: { url: string } ) {
	return <CollidingCards imageUrl={ useMshotImage( url ) } />;
}
