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

const SingleProductPlanPriceGroup = props => {
	const { billingTimeFrame, currencyCode, discountedPrice, fullPrice } = props;
	const isDiscounted = !! discountedPrice;
	const priceGroupClasses = classNames( 'single-product-plan__price-group', {
		'is-discounted': isDiscounted,
	} );

	return (
		<div className={ priceGroupClasses }>
			<PlanPrice currencyCode={ currencyCode } rawPrice={ fullPrice } original={ isDiscounted } />
			{ isDiscounted && (
				<PlanPrice currencyCode={ currencyCode } rawPrice={ discountedPrice } discounted />
			) }
			<span className="single-product-plan__billing-timeframe">{ billingTimeFrame }</span>
		</div>
	);
};

SingleProductPlanPriceGroup.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	discountedPrice: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.arrayOf( PropTypes.number ),
	] ),
	fullPrice: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
};

export default SingleProductPlanPriceGroup;
