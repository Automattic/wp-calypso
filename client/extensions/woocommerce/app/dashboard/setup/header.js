/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

const SetupHeader = ( { imageSource, imageWidth, subtitle, title, children } ) => {
	return (
		<div className="setup__header">
			{ imageSource && (
				<img
					src={ imageSource }
					width={ imageWidth }
					className="setup__header-image"
					alt=""
				/>
			) }
			{ <h2 className="setup__header-title form-section-heading">{ title }</h2> }
			{ subtitle && <p className="setup__header-subtitle">{ subtitle }</p> }
			{ children }
		</div>
	);
};

SetupHeader.propTypes = {
	imageSource: PropTypes.string,
	imageWidth: PropTypes.number,
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.oneOfType( [ PropTypes.array, PropTypes.string ] ),
};

export default SetupHeader;
