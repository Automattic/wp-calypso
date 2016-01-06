/**
 * External dependencies
 */
var React = require( 'react' ),
	isUndefined = require( 'lodash/lang/isUndefined' );

module.exports = React.createClass( {
	displayName: 'PlanPrice',

	getFormattedPrice: function( plan ) {
		var rawPrice, formattedPrice;

		if ( plan ) {
			// the properties of a plan object from sites-list is snake_case
			// the properties of a plan object from the global state are camelCase
			rawPrice = isUndefined( plan.rawPrice ) ? plan.raw_price : plan.rawPrice;
			formattedPrice = isUndefined( plan.formattedPrice ) ? plan.formatted_price : plan.formattedPrice;

			if ( rawPrice === 0 ) {
				return this.translate( 'Free', { context: 'Zero cost product price' } );
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
	    const { plan, sitePlan: details } = this.props;
	    const hasDiscount = details && details.rawDiscount > 0;

	    if ( this.props.isPlaceholder ) {
			return <div className="plan-price is-placeholder" />;
		}

	    return (
	        <div className="plan-price">
	            <span>{ this.getPrice() }</span>
	            <small className="plan-price__billing-period">
	                { hasDiscount ? this.translate( 'for first year' ) : plan.bill_period_label }
	            </small>
	        </div>
	    );
	}
} );
