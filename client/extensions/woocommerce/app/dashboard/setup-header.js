/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

const SetupHeader = ( { imageSource, imageWidth, subtitle, title, children } ) => {
	return (
		<div className="dashboard__setup-header">
			{ imageSource && ( <img src={ imageSource } width={ imageWidth } className="dashboard__setup-header-image" alt="" /> ) }
			{ <h2 className="dashboard__setup-header-title form-section-heading">{ title }</h2> }
			{ subtitle && ( <p className="dashboard__setup-header-subtitle">{ subtitle }</p> ) }
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
