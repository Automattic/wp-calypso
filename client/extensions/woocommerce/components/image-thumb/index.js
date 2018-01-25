/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ImageThumb = ( { width, height, src, alt, ...props } ) => {
	const style = {
		width,
		height,
		minHeight: height,
	};

	const imageClasses = classNames( 'image-thumb', {
		hasImage: src,
	} );
	const placeholderClasses = classNames( 'image-thumb__placeholder' );

	if ( ! src ) {
		return (
			<div className={ imageClasses }>
				{' '}
				<div className={ placeholderClasses } style={ style } />{' '}
			</div>
		);
	}

	return (
		<div className={ imageClasses } style={ style }>
			<img src={ src } style={ style } alt={ alt } { ...props } />
		</div>
	);
};

ImageThumb.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
	className: PropTypes.string,
	src: PropTypes.string,
	alt: PropTypes.string.isRequired,
};

ImageThumb.defaultProps = {
	width: 40,
	height: 40,
	className: '',
	src: '',
};

export default ImageThumb;
