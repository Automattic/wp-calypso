/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

const GSuiteSingleFeature = ( { compact, description, imagePath, imageAlt, title } ) => {
	return (
		<div className={ compact ? 'gsuite-features__compact-feature' : 'gsuite-features__feature' }>
			<div className="gsuite-features__feature-image">
				<img alt={ imageAlt } src={ imagePath } />
			</div>
			<div className="gsuite-features__feature-block">
				<h5 className="gsuite-features__feature-header">{ title }</h5>
				{ description && <p>{ description }</p> }
			</div>
		</div>
	);
};

GSuiteSingleFeature.propTypes = {
	compact: PropTypes.bool.isRequired,
	description: PropTypes.string,
	imageAlt: PropTypes.string.isRequired,
	imagePath: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
};

export default GSuiteSingleFeature;
