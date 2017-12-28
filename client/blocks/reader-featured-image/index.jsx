/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import cssSafeUrl from 'client/lib/css-safe-url';
import resizeImageUrl from 'client/lib/resize-image-url';

const ReaderFeaturedImage = ( { imageUrl, imageWidth, href, children, onClick, className } ) => {
	if ( imageUrl === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + cssSafeUrl( resizeImageUrl( imageUrl, { w: imageWidth } ) ) + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center center',
	};

	const classNames = classnames( className, 'reader-featured-image' );

	return (
		<a className={ classNames } href={ href } style={ featuredImageStyle } onClick={ onClick }>
			{ children }
		</a>
	);
};

ReaderFeaturedImage.propTypes = {
	imageUrl: PropTypes.string,
	href: PropTypes.string,
	onClick: PropTypes.func,
};

ReaderFeaturedImage.defaultProps = {
	onClick: noop,
	imageWidth: 250,
};

export default ReaderFeaturedImage;
