/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const SetupHeader = ( { imageSource, imageWidth, subtitle, title } ) => {
	return (
		<div className="dashboard__setup-header">
			{ imageSource && ( <img src={ imageSource } width={ imageWidth } className="dashboard__setup-header-image" /> ) }
			{ <h2 className="dashboard__setup-header-title form-section-heading">{ title }</h2> }
			{ subtitle && ( <p className="dashboard__setup-header-subtitle">{ subtitle }</p> ) }
		</div>
	);
};

SetupHeader.propTypes = {
	imageSource: PropTypes.string,
	imageWidth: PropTypes.number,
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
};

export default SetupHeader;
