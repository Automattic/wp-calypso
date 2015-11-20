/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'PlanPrice',

	getFormattedPrice: function( planDetails ) {
		if ( planDetails ) {
			if ( planDetails.raw_price === 0 ) {
				return this.translate( 'Free', { context: 'Zero cost product price' } );
			}

			return planDetails.formatted_price;
		}
		return this.translate( 'Loading' );
	},

	getPrice: function() {
		var standardPrice = this.getFormattedPrice( this.props.plan ),
			discountedPrice = this.getFormattedPrice( this.props.siteSpecificPlansDetails );

		if ( this.props.siteSpecificPlansDetails && this.props.siteSpecificPlansDetails.raw_discount > 0 ) {
			return ( <span><span className="plan-price__discounted">{ standardPrice }</span> { discountedPrice }</span> );
		}

		return ( <span>{ standardPrice }</span> );
	},

	render: function() {
	    const { plan, siteSpecificPlansDetails: details } = this.props;
	    const hasDiscount = details && details.raw_discount > 0;

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
