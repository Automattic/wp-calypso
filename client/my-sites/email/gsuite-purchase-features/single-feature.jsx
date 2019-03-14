/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

const GSuitePurchaseFeaturesSingleFeature = ( { description, imagePath, imageAlt, title } ) => {
	return (
		<div className="gsuite-purchase-features__feature">
			<div className="gsuite-purchase-features__feature-image">
				<img alt={ imageAlt } src={ imagePath } />
			</div>
			<div className="gsuite-purchase-features__feature-block">
				<h5 className="gsuite-purchase-features__feature-header">{ title }</h5>
				<p>{ description }</p>
			</div>
		</div>
	);
};

GSuitePurchaseFeaturesSingleFeature.propTypes = {
	description: PropTypes.string.isRequired,
	imageAlt: PropTypes.string.isRequired,
	imagePath: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
};

export default GSuitePurchaseFeaturesSingleFeature;
