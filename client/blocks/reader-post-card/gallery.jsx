/**
 * External Dependencies
 */
import React from 'react';
import { map, take } from 'lodash';

/**
 * Internal Dependencies
 */
import resizeImageUrl from 'lib/resize-image-url';

const GALLERY_ITEM_WIDTH = 206;

const PostGallery = ( { post } ) => {
	const numberOfImagesToDisplay = 4;
	const imagesToDisplay = take( post.content_images, numberOfImagesToDisplay );
	const listItems = map( imagesToDisplay, ( image, index ) => {
		const imageUrl = resizeImageUrl( image.src, { w: GALLERY_ITEM_WIDTH } );
		const safeCssUrl = imageUrl.replace( ')', '\\)' ).replace( '(', '\\(' );
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
