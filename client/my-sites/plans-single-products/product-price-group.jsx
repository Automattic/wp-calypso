/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanPrice from 'my-sites/plan-price';

const PlansSingleProductPriceGroup = props => {
	const { billingTimeFrame, currencyCode, discountedPrice, fullPrice, isPlaceholder } = props;
	const isDiscounted = !! discountedPrice;
	const priceGroupClasses = classNames( 'plans-single-products__price-group', {
		'is-discounted': isDiscounted,
		'is-placeholder': isPlaceholder,
	} );

	if ( ! isDiscounted ) {
		return (
			<div className={ priceGroupClasses }>
				<PlanPrice currencyCode={ currencyCode } rawPrice={ fullPrice } />
				<span className="plans-single-products__billing-timeframe">{ billingTimeFrame }</span>
			</div>
		);
	}

	return (
		<div className={ priceGroupClasses }>
			<PlanPrice currencyCode={ currencyCode } rawPrice={ fullPrice } original />
			<PlanPrice currencyCode={ currencyCode } rawPrice={ discountedPrice } discounted />
			<span className="plans-single-products__billing-timeframe">{ billingTimeFrame }</span>
		</div>
	);
};

PlansSingleProductPriceGroup.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	discountedPrice: PropTypes.number,
	fullPrice: PropTypes.number,
	isPlaceholder: PropTypes.bool,
};

export default PlansSingleProductPriceGroup;
