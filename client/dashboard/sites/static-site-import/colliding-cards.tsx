import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useMshotImage } from './use-mshot-image';

import './colliding-cards.scss';

/**
 * Two cards taking turns to swing out and strike each other, like a Newton's cradle. Each hit
 * slides the site's screenshot across the line between them, with one card winning it gradually.
 */
export function CollidingCards( { imageUrl }: { imageUrl?: string } ) {
	return (
		<div className="static-site-import-colliding-cards" aria-hidden="true">
			{ [ 'is-left', 'is-right' ].map( ( side ) => (
				<div key={ side } className={ `static-site-import-colliding-cards__card ${ side }` }>
					{ side === 'is-left' && (
						<WordPressLogo className="static-site-import-colliding-cards__watermark" />
					) }
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
