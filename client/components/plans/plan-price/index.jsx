/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { isJetpackMonthlyPlan } from 'lib/products-values';
import WpcomPlanPrice from 'my-sites/plans/wpcom-plan-price';

class PlanPrice extends React.Component {
	getFormattedPrice = plan => {
		let rawPrice, formattedPrice, months;

		if ( plan ) {
			// the properties of a plan object from sites-list is snake_case
			// the properties of a plan object from the global state are camelCase
			rawPrice = isUndefined( plan.rawPrice ) ? plan.raw_price : plan.rawPrice;
			formattedPrice = isUndefined( plan.formattedPrice )
				? plan.formatted_price
				: plan.formattedPrice;

			if ( rawPrice === 0 ) {
				return this.props.translate( 'Free', { context: 'Zero cost product price' } );
			}

			months = isJetpackMonthlyPlan( plan ) ? 1 : 12;

			// could get $5.95, A$4.13, ¥298, €3,50, etc…
			const getCurrencySymbol = price => /(\D+)\d+/.exec( price )[ 1 ];
			const currencyDigits = currencySymbol =>
				get(
					{
						'¥': 0,
					},
					currencySymbol,
					2
				);

			const currencySymbol = getCurrencySymbol( formattedPrice );
			const monthlyPrice = ( rawPrice / months ).toFixed( currencyDigits( currencySymbol ) );

			return `${ currencySymbol }${ monthlyPrice }`;
		}

		return this.props.translate( 'Loading' );
	};

	getPrice = () => {
		const standardPrice = this.getFormattedPrice( this.props.plan ),
			discountedPrice = this.getFormattedPrice( this.props.sitePlan );

		if ( this.props.sitePlan && this.props.sitePlan.rawDiscount > 0 ) {
			return (
				<span>
					<span className="plan-price__discounted">{ standardPrice }</span> { discountedPrice }
				</span>
			);
		}

		return <span>{ standardPrice }</span>;
	};

	render() {
		let periodLabel;
		const { plan, sitePlan: details } = this.props,
			hasDiscount = details && details.rawDiscount > 0;

		if ( this.props.isPlaceholder ) {
			return <div className="plan-price is-placeholder" />;
		}

		if ( ! plan ) {
			periodLabel = '';
		} else if ( plan.raw_price > 0 ) {
			if ( isJetpackMonthlyPlan( plan ) ) {
				periodLabel = this.props.translate( 'per month, billed monthly' );
			} else {
				periodLabel = this.props.translate( 'per month, billed yearly' );
			}
		} else {
			periodLabel = hasDiscount
				? this.props.translate( 'due today when you upgrade' )
				: plan.bill_period_label;
		}

		return (
			<WpcomPlanPrice
				getPrice={ this.getPrice }
				hasDiscount={ hasDiscount }
				periodLabel={ periodLabel }
			/>
		);
	}
}

export default localize( PlanPrice );
