/** @format */
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
		const { currencyCode, discountPrice, originalPrice } = this.props;

		// Ensure we have required props.
		if ( ! currencyCode || ! discountPrice || ! originalPrice ) {
			return null;
		}

		const price = this.getDiscountPriceObject();
		const { translate } = this.props;
		return translate( 'Save {{b}}%(symbol)s%(integer)s%(fraction)s{{/b}} over monthly.', {
			args: price,
			components: { b: <b /> },
		} );
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
					Link: <a href={ plansLink( basePlansPath, siteSlug, 'yearly' ) } />,
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
