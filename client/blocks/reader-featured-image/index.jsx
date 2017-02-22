/**
 * External Dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import cssSafeUrl from 'lib/css-safe-url';
import resizeImageUrl from 'lib/resize-image-url';

const FEATURED_IMAGE_WIDTH = 250;

const ReaderFeaturedImage = ( { imageUrl, href, children, onClick } ) => {
	if ( imageUrl === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + cssSafeUrl( resizeImageUrl( imageUrl, { w: FEATURED_IMAGE_WIDTH } ) ) + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center center'
	};

	return (
		<a className="reader-featured-image" href={ href } style={ featuredImageStyle } onClick={ onClick }>
			{ children }
		</a>
	);
};

ReaderFeaturedImage.propTypes = {
	imageUrl: React.PropTypes.string,
	href: React.PropTypes.string,
	onClick: React.PropTypes.func,
};

ReaderFeaturedImage.defaultProps = {
	onClick: noop,
};

export default ReaderFeaturedImage;
