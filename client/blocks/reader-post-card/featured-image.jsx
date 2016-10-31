/**
 * External Dependencies
 */
import React from 'react';
import { noop } from 'lodash';

const FeaturedImage = ( { style, imageUri, href, children, onClick } ) => {
	if ( imageUri === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		...style,
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

FeaturedImage.propTypes = {
	imageUri: React.PropTypes.string,
	href: React.PropTypes.string,
	onClick: React.PropTypes.func,
};

FeaturedImage.defaultProps = {
	onClick: noop,
};

export default FeaturedImage;

