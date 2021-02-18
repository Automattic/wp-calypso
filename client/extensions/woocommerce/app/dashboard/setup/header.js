/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

const SetupHeader = ( { imageSource, imageWidth, subtitle, title, children } ) => {
	const Tag = 'string' === typeof subtitle ? 'p' : 'div';

	return (
		<div className="setup__header">
			{ imageSource && (
				<img src={ imageSource } width={ imageWidth } className="setup__header-image" alt="" />
			) }
			{ <h2 className="setup__header-title form-section-heading">{ title }</h2> }
			{ subtitle && <Tag className="setup__header-subtitle">{ subtitle }</Tag> }
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
