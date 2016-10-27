/**
 * External Dependencies
 */
import React from 'react';

const FeaturedImage = ( { imageUri, href, children, onClick } ) => {
	if ( imageUri === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + imageUri + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: '50% 50%'
	};

	return (
		<a className="reader-post-card__featured-image" href={ href } style={ featuredImageStyle } onClick={ onClick } >
			{ children }
		</a>
	);
};

export default FeaturedImage;

