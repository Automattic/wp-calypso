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
	const {
		billingTimeFrame,
		currencyCode,
		discountedPrice,
		discountedPriceRange,
		fullPrice,
		fullPriceRange,
	} = props;
	const isDiscounted = !! discountedPrice || !! discountedPriceRange;
	const priceGroupClasses = classNames( 'single-product-plan__price-group', {
		'is-discounted': isDiscounted,
	} );

	return (
		<div className={ priceGroupClasses }>
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ fullPrice }
				rawPriceRange={ fullPriceRange }
				original={ isDiscounted }
			/>
			{ isDiscounted && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ discountedPrice }
					rawPriceRange={ discountedPriceRange }
					discounted
				/>
			) }
			<span className="single-product-plan__billing-timeframe">{ billingTimeFrame }</span>
		</div>
	);
};

SingleProductPlanPriceGroup.propTypes = {
	billingTimeFrame: PropTypes.string,
	currencyCode: PropTypes.string,
	discountedPrice: PropTypes.number,
	discountedPriceRange: PropTypes.array,
	fullPrice: PropTypes.number,
	fullPriceRange: PropTypes.array,
};

export default SingleProductPlanPriceGroup;
