/**
 * External dependencies
 */
import isUndefined from 'lodash/isUndefined';
import React from 'react';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import WpcomPlanPrice from 'my-sites/plans/wpcom-plan-price';

const PlanPrice = React.createClass( {
	getFormattedPrice( plan ) {
		let rawPrice, formattedPrice;

		if ( plan ) {
			// the properties of a plan object from sites-list is snake_case
			// the properties of a plan object from the global state are camelCase
			rawPrice = isUndefined( plan.rawPrice ) ? plan.raw_price : plan.rawPrice;
			formattedPrice = isUndefined( plan.formattedPrice ) ? plan.formatted_price : plan.formattedPrice;

			if ( rawPrice === 0 ) {
				return this.translate( 'Free', { context: 'Zero cost product price' } );
			}

			if ( abtest( 'planPricing' ) === 'monthly' && plan.bill_period === 365 ) {
				const monthlyPrice = +( rawPrice / 12 ).toFixed( 2 );
				formattedPrice = formattedPrice.replace( rawPrice, monthlyPrice );
			}

			return formattedPrice;
		}

		return this.translate( 'Loading' );
	},

	getPrice() {
		const standardPrice = this.getFormattedPrice( this.props.plan ),
			discountedPrice = this.getFormattedPrice( this.props.sitePlan );

		if ( this.props.sitePlan && this.props.sitePlan.rawDiscount > 0 ) {
			return ( <span><span className="plan-price__discounted">{ standardPrice }</span> { discountedPrice }</span> );
		}

		return ( <span>{ standardPrice }</span> );
	},

	render() {
		let periodLabel;
		const { plan, sitePlan: details } = this.props,
			hasDiscount = details && details.rawDiscount > 0;

		if ( this.props.isPlaceholder ) {
			return <div className="plan-price is-placeholder" />;
		}

		if ( ! plan ) {
			periodLabel = '';
		} else if ( abtest( 'planPricing' ) === 'monthly' && plan.raw_price > 0 ) {
			periodLabel = this.translate( 'per month, billed yearly' );
			if ( plan.product_type === 'jetpack' ) {
				//jetpack supports monthly plans
				if ( plan.bill_period === 31 ) {
					periodLabel = this.translate( 'per month, billed monthly' );
				}
			}
		} else {
			periodLabel = hasDiscount ? this.translate( 'due today when you upgrade' ) : plan.bill_period_label;
		}

		return (
			<WpcomPlanPrice
				getPrice={ this.getPrice }
				hasDiscount={ hasDiscount }
				periodLabel={ periodLabel } />
		);
	}
} );

export default PlanPrice;
