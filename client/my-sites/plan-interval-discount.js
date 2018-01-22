/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { plansLink } from 'lib/plans';

/**
 * Internal Dependencies
 **/
import { getCurrencyObject } from 'lib/format-currency';

class PlanIntervalDiscount extends Component {
	static propTypes = {
		currencyCode: PropTypes.string.isRequired,
		discountPrice: PropTypes.number.isRequired,
		isYearly: PropTypes.bool.isRequired,
		originalPrice: PropTypes.number.isRequired,
		site: PropTypes.object,
	};

	static defaultProps = {
		currencyCode: 'USD',
	};

	getDiscountPriceObject() {
		const { currencyCode, discountPrice, originalPrice } = this.props;
		return getCurrencyObject( originalPrice - discountPrice, currencyCode );
	}

	renderYearlyViewDiscountInfo() {
		const { currencyCode, discountPrice, originalPrice } = this.props;

		// Ensure we have required props.
		if ( ! currencyCode || ! discountPrice || ! originalPrice ) {
			return null;
		}

		const price = this.getDiscountPriceObject();
		const { translate } = this.props;
		return translate( 'Save %(symbol)s%(integer)s%(fraction)s over monthly.', {
			args: price,
		} );
	}

	renderMonthlyViewDiscountInfo() {
		const { currencyCode, discountPrice, originalPrice } = this.props;

		// Ensure we have required props.
		if ( ! currencyCode || ! discountPrice || ! originalPrice ) {
			return null;
		}

		const price = this.getDiscountPriceObject();
		const { site, translate } = this.props;
		return translate(
			'Save %(symbol)s%(integer)s%(fraction)s when you {{Link}}buy yearly{{/Link}}.',
			{
				args: price,
				components: {
					Link: <a href={ plansLink( '/jetpack/connect/plans', site, 'yearly' ) } />,
				},
			}
		);
	}

	render() {
		const { isYearly } = this.props;
		return (
			<div className="my-sites__plan-interval-discount">
				{ isYearly ? this.renderYearlyViewDiscountInfo() : this.renderMonthlyViewDiscountInfo() }
			</div>
		);
	}
}

export default localize( PlanIntervalDiscount );
