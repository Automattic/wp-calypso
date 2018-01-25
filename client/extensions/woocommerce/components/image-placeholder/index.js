/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

const ImagePlaceholder = ( { width, height } ) => {
	const style = {
		width,
		height,
		minHeight: height,
	};

	return <div className="image-placeholder" style={ style } />;
};

ImagePlaceholder.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
};

ImagePlaceholder.defaultProps = {
	width: 40,
	height: 40,
};

export default ImagePlaceholder;
