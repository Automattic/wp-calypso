/**
 * External Dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import cssSafeUrl from 'lib/css-safe-url';
import resizeImageUrl from 'lib/resize-image-url';

const ReaderFeaturedImage = ( { imageUrl, imageWidth, href, children, onClick, className } ) => {
	if ( imageUrl === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + cssSafeUrl( resizeImageUrl( imageUrl, { w: imageWidth } ) ) + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center center'
	};

	const classNames = classnames( className, 'reader-featured-image' );

	return (
		<a className={ classNames } href={ href } style={ featuredImageStyle } onClick={ onClick }>
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
	imageWidth: 250,
};

export default ReaderFeaturedImage;
