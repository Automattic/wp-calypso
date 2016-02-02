/**
 * External dependencies
 */
var React = require( 'react' ),
	isUndefined = require( 'lodash/lang/isUndefined' );

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

var JetpackPlanPrice = require( 'my-sites/plans/jetpack-plan-price' ),
	WpcomPlanPrice = require( 'my-sites/plans/wpcom-plan-price' );

module.exports = React.createClass( {
	displayName: 'PlanPrice',

	getFormattedPrice: function( plan ) {
		let rawPrice, formattedPrice;

		if ( plan ) {
			// the properties of a plan object from sites-list is snake_case
			// the properties of a plan object from the global state are camelCase
			rawPrice = isUndefined( plan.rawPrice ) ? plan.raw_price : plan.rawPrice;
			formattedPrice = isUndefined( plan.formattedPrice ) ? plan.formatted_price : plan.formattedPrice;

			if ( rawPrice === 0 ) {
				return this.translate( 'Free', { context: 'Zero cost product price' } );
			}

			if ( abtest( 'monthlyPlanPricing' ) === 'monthly' && this.props.isInSignup ) {
				const monthlyPrice = +( rawPrice / 12 ).toFixed( 2 );
				formattedPrice = formattedPrice.replace( rawPrice, monthlyPrice );
			}

			return formattedPrice;
		}

		return this.translate( 'Loading' );
	},

	getPrice: function() {
		var standardPrice = this.getFormattedPrice( this.props.plan ),
			discountedPrice = this.getFormattedPrice( this.props.sitePlan );

		if ( this.props.sitePlan && this.props.sitePlan.rawDiscount > 0 ) {
			return ( <span><span className="plan-price__discounted">{ standardPrice }</span> { discountedPrice }</span> );
		}

		return ( <span>{ standardPrice }</span> );
	},

	render: function() {
		let periodLabel;
		const { plan, site, sitePlan: details } = this.props,
			hasDiscount = details && details.rawDiscount > 0;

		if ( this.props.isPlaceholder ) {
			return <div className="plan-price is-placeholder" />;
		}

		if ( abtest( 'monthlyPlanPricing' ) === 'monthly' && this.props.isInSignup && plan.raw_price !== 0 ) {
			periodLabel = this.translate( 'per month, billed yearly' );
		} else {
			periodLabel = hasDiscount ? this.translate( 'due today when you upgrade' ) : plan.bill_period_label
		}

		if ( site && site.jetpack ) {
			return (
				<JetpackPlanPrice
					getPrice={ this.getPrice }
					hasDiscount={ hasDiscount }
					plan={ plan } />
			);
		}

		return (
			<WpcomPlanPrice
				getPrice={ this.getPrice }
				hasDiscount={ hasDiscount }
				periodLabel={ periodLabel }
				plan={ plan } />
		);
	}
} );
