/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';

/**
 * Style dependencies
 */
import './style.scss';

const ReaderFeaturedImage = ( {
	imageUrl,
	imageWidth,
	href,
	children,
	onClick,
	className,
	fetched,
} ) => {
	if ( imageUrl === undefined ) {
		return null;
	}

	// Don't resize image if it was already fetched.
	const resizedUrl = fetched ? imageUrl : resizeImageUrl( imageUrl, { w: imageWidth } );

	if ( ! resizedUrl ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + cssSafeUrl( resizedUrl ) + ')',
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
