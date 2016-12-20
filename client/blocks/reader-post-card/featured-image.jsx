/**
 * External Dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import cssSafeUrl from 'lib/css-safe-url';

const FeaturedImage = ( { imageUri, href, children, onClick, offset } ) => {
	if ( imageUri === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + cssSafeUrl( imageUri ) + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'right center'
	};

	if ( offset ) {
		featuredImageStyle.backgroundPosition = `${ offset.x }px ${ offset.y }px`;
	}

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
