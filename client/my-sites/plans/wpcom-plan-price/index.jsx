/**
 * External dependencies
 */
import React from 'react';

const WpcomPlanPrice = ( { getPrice, hasDiscount, periodLabel } ) => {
	return (
		<div className={ hasDiscount ? 'wpcom-plan-price wpcom-plan-price__discount' : 'wpcom-plan-price' }>
			<span>{ getPrice() }</span>

			<small className="wpcom-plan-price__billing-period">
				{ periodLabel }
			</small>
		</div>
	);
};

WpcomPlanPrice.propTypes = {
	getPrice: React.PropTypes.func.isRequired,
	hasDiscount: React.PropTypes.bool,
	periodLabel: React.PropTypes.string.isRequired
};

export default WpcomPlanPrice;
