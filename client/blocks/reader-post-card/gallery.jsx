/**
 * External Dependencies
 */
import React from 'react';
import { map, take, filter } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import { imageIsBigEnoughForGallery } from 'state/reader/posts/normalization-rules';
import resizeImageUrl from 'lib/resize-image-url';
import cssSafeUrl from 'lib/css-safe-url';
import { isFeaturedImageInContent } from 'lib/post-normalizer/utils';
import ReaderExcerpt from 'blocks/reader-excerpt';
import { READER_CONTENT_WIDTH } from 'state/reader/posts/normalization-rules';

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

const PostGallery = ( { post, children, isDiscover } ) => {
	const imagesToDisplay = getGalleryWorthyImages( post );
	const listItems = map( imagesToDisplay, ( image, index ) => {
		const imageUrl = resizeImageUrl( image.src, { w: READER_CONTENT_WIDTH / imagesToDisplay.length } );
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
		<div className="reader-post-card__post" >
			<ul className="reader-post-card__gallery">
				{ listItems }
			</ul>
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>{ post.title }</a>
					</h1>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				{ children }
				</div>
		</div> );
};

PostGallery.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default PostGallery;
