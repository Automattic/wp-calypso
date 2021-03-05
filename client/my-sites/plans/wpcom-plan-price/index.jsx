/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

const WpcomPlanPrice = ( { getPrice, hasDiscount, periodLabel } ) => {
	return (
		<div
			className={ hasDiscount ? 'wpcom-plan-price wpcom-plan-price__discount' : 'wpcom-plan-price' }
		>
			<span>{ getPrice() }</span>

			<small className="wpcom-plan-price__billing-period">{ periodLabel }</small>
		</div>
	);
};

WpcomPlanPrice.propTypes = {
	getPrice: PropTypes.func.isRequired,
	hasDiscount: PropTypes.bool,
	periodLabel: PropTypes.string.isRequired,
};

export default WpcomPlanPrice;
