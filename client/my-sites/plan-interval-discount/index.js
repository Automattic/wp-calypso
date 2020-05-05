/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { plansLink } from 'lib/plans';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal Dependencies
 **/

/**
 * Style Dependencies
 */
import './style.scss';

class PlanIntervalDiscount extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string.isRequired,
		currencyCode: PropTypes.string.isRequired,
		discountPrice: PropTypes.number.isRequired,
		isYearly: PropTypes.bool.isRequired,
		originalPrice: PropTypes.number.isRequired,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		currencyCode: 'USD',
	};

	getDiscountPriceObject() {
		const { currencyCode, discountPrice, originalPrice } = this.props;
		return getCurrencyObject( originalPrice - discountPrice, currencyCode );
	}

	renderYearlyViewDiscountInfo() {
		const { basePlansPath, currencyCode, discountPrice, originalPrice } = this.props;

		// Ensure we have required props.
		if ( ! currencyCode || ! discountPrice || ! originalPrice ) {
			return null;
		}

		const price = this.getDiscountPriceObject();
		const { siteSlug, translate } = this.props;
		/* translators: symbol is a currency symbol,
		   integer is the integer amount of the sum (eg 18 of 18.50), fraction is the fraction. Eg (.50 of the 18.50) */
		return translate(
			'Save {{b}}%(symbol)s%(integer)s%(fraction)s{{/b}} over {{Link}}monthly{{/Link}}.',
			{
				args: price,
				components: {
					b: <b />,
					Link: <a href={ plansLink( basePlansPath, siteSlug, 'monthly', true ) } />,
				},
			}
		);
	}

	renderMonthlyViewDiscountInfo() {
		const { basePlansPath, currencyCode, discountPrice, originalPrice } = this.props;

		// Ensure we have required props.
		if ( ! basePlansPath || ! currencyCode || ! discountPrice || ! originalPrice ) {
			return null;
		}

		const price = this.getDiscountPriceObject();
		const { siteSlug, translate } = this.props;
		return translate(
			'Save {{b}}%(symbol)s%(integer)s%(fraction)s{{/b}} when you {{Link}}buy yearly{{/Link}}.',
			{
				args: price,
				components: {
					Link: <a href={ plansLink( basePlansPath, siteSlug, 'yearly', true ) } />,
					b: <b />,
				},
			}
		);
	}

	render() {
		const { isYearly } = this.props;
		return (
			<div className="plan-interval-discount">
				{ isYearly ? this.renderYearlyViewDiscountInfo() : this.renderMonthlyViewDiscountInfo() }
			</div>
		);
	}
}

export default localize( PlanIntervalDiscount );
