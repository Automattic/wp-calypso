/**
 * External Dependencies
 */
import React from 'react';
import { map, take } from 'lodash';

const PostGallery = ( { post } ) => {
	const numberOfImagesToDisplay = 4;
	const imagesToDisplay = take( post.content_images, numberOfImagesToDisplay );
	const listItems = map( imagesToDisplay, ( image, index ) => {
		const imageStyle = {
			backgroundImage: 'url(' + image.src + ')',
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
