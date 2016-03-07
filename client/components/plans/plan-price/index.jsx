/**
 * External dependencies
 */
var React = require( 'react' ),
	isUndefined = require( 'lodash/isUndefined' );

var WpcomPlanPrice = require( 'my-sites/plans/wpcom-plan-price' );

module.exports = React.createClass( {
	displayName: 'PlanPrice',

	getFormattedPrice: function( plan ) {
		if ( plan ) {
			// the properties of a plan object from sites-list is snake_case
			// the properties of a plan object from the global state are camelCase
			const rawPrice = isUndefined( plan.rawPrice ) ? plan.raw_price : plan.rawPrice,
				formattedPrice = isUndefined( plan.formattedPrice ) ? plan.formatted_price : plan.formattedPrice;

			if ( rawPrice === 0 ) {
				return this.translate( 'Free', { context: 'Zero cost product price' } );
			}

			return formattedPrice;
		}

		return this.translate( 'Loading' );
	},

	getPrice: function() {
		const standardPrice = this.getFormattedPrice( this.props.plan ),
			discountedPrice = this.getFormattedPrice( this.props.sitePlan );

		if ( this.props.sitePlan && this.props.sitePlan.rawDiscount > 0 ) {
			return ( <span><span className="plan-price__discounted">{ standardPrice }</span> { discountedPrice }</span> );
		}

		return ( <span>{ standardPrice }</span> );
	},

	render: function() {
		const { plan, sitePlan: details } = this.props,
			hasDiscount = details && details.rawDiscount > 0;

		if ( this.props.isPlaceholder ) {
			return <div className="plan-price is-placeholder" />;
		}

		return (
			<WpcomPlanPrice
				getPrice={ this.getPrice }
				hasDiscount={ hasDiscount }
				periodLabel={ hasDiscount ? this.translate( 'due today when you upgrade' ) : plan.bill_period_label }
				plan={ plan } />
		);
	}
} );
