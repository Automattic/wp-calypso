/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import MediaImage from 'calypso/my-sites/media-library/media-image';

const ImageThumb = ( { width, height, src, alt, placeholder, ...props } ) => {
	const style = {
		width,
		height,
		minHeight: height,
	};

	const imageClasses = classNames( 'image-thumb', {
		hasImage: src,
	} );

	if ( ! src ) {
		if ( placeholder ) {
			style.backgroundImage = `url( ${ placeholder } )`;
		}

		return (
			<div className={ imageClasses }>
				<div className="image-thumb__placeholder" style={ style } />
			</div>
		);
	}

	return (
		<div className={ imageClasses } style={ style }>
			<MediaImage src={ src } alt={ alt } { ...props } />
		</div>
	);
};

ImageThumb.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
	className: PropTypes.string,
	src: PropTypes.string,
	placeholder: PropTypes.string,
	alt: PropTypes.string.isRequired,
};

ImageThumb.defaultProps = {
	width: 40,
	height: 40,
	className: '',
	src: '',
};

export default ImageThumb;
