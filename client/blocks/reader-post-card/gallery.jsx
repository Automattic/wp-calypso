/**
 * External Dependencies
 */
import React from 'react';
import { map, take, filter } from 'lodash';

/**
 * Internal Dependencies
 */
import { imageIsBigEnoughForGallery } from 'state/reader/posts/normalization-rules';
import resizeImageUrl from 'lib/resize-image-url';
import cssSafeUrl from 'lib/css-safe-url';
import { isFeaturedImageInContent } from 'lib/post-normalizer/utils';

const GALLERY_ITEM_THUMBNAIL_WIDTH = 420;

function getGalleryWorthyImages( post ) {
	const numberOfImagesToDisplay = 4;
	const images = post.images && [ ...post.images ] || [];
	const indexToRemove = isFeaturedImageInContent( post );
	if ( indexToRemove ) {
		images.splice( indexToRemove, 1 );
	}

	const worthyImages = filter( images, imageIsBigEnoughForGallery );
	return take( worthyImages, numberOfImagesToDisplay );
}

const PostGallery = ( { post } ) => {
	const imagesToDisplay = getGalleryWorthyImages( post );
	const listItems = map( imagesToDisplay, ( image, index ) => {
		const imageUrl = resizeImageUrl( image.src, { w: GALLERY_ITEM_THUMBNAIL_WIDTH } );
		const safeCssUrl = cssSafeUrl( imageUrl );
		const imageStyle = {
			backgroundImage: 'url(' + safeCssUrl + ')',
			backgroundSize: 'cover',
			backgroundPosition: '50% 50%',
			backgroundRepeat: 'no-repeat'
		};
		return (
			<li key={ `post-${ post.ID }-image-${ index }` } className="reader-post-card__gallery-item">
				<div className="reader-post-card__gallery-image" style={ imageStyle }></div>
			</li>
		);
	} );
	return (
		<ul className="reader-post-card__gallery">
			{ listItems }
		</ul>
	);
};

PostGallery.propTypes = {
	post: React.PropTypes.object.isRequired
};

export default PostGallery;
