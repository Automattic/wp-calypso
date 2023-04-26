import classnames from 'classnames';
import { MediaProps } from './types';

export const Media: React.FC< MediaProps > = ( { media } ) => {
	if ( ! media ) {
		return null;
	}

	// Ensure we're only trying to show valid media, and the correct quantity.
	const filteredMedia = media
		// Only image/ and video/ mime types are supported.
		.filter(
			( mediaItem ) =>
				mediaItem.type.startsWith( 'image/' ) || mediaItem.type.startsWith( 'video/' )
		)
		.filter( ( mediaItem, idx, array ) => {
			// We'll always keep the first item.
			if ( 0 === idx ) {
				return true;
			}

			// If the first item was a video or GIF, discard all subsequent items.
			if ( array[ 0 ].type.startsWith( 'video/' ) || 'image/gif' === array[ 0 ].type ) {
				return false;
			}

			// The first item wasn't a video or GIF, so discard all subsequent videos and GIFs.
			if ( mediaItem.type.startsWith( 'video/' ) || 'image/gif' === mediaItem.type ) {
				return false;
			}

			return true;
		} )
		// We only want the first four items of the array, at most.
		.slice( 0, 4 );

	const isVideo = filteredMedia.length > 0 && filteredMedia[ 0 ].type.startsWith( 'video/' );

	const mediaClasses = classnames( [
		'twitter-preview__media',
		'twitter-preview__media-children-' + filteredMedia.length,
	] );

	if ( 0 === filteredMedia.length ) {
		return null;
	}

	return (
		<div className={ mediaClasses }>
			{ isVideo &&
				filteredMedia.map( ( mediaItem, index ) => (
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video key={ `twitter-preview__media-item-${ index }` } controls>
						<source src={ mediaItem.url } type={ mediaItem.type } />{ ' ' }
					</video>
				) ) }
			{ ! isVideo &&
				filteredMedia.map( ( mediaItem, index ) => (
					<img
						key={ `twitter-preview__media-item-${ index }` }
						alt={ mediaItem.alt }
						src={ mediaItem.url }
					/>
				) ) }
		</div>
	);
};
