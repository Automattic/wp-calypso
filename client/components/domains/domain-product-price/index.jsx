/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var PremiumPopover = require( 'components/plans/premium-popover' ),
	abtest = require( 'lib/abtest' ).abtest;

const domainsWithPlansOnlyTestEnabled = abtest( 'domainsWithPlansOnly' ) === 'plansOnly';

var DomainProductPrice = React.createClass( {
	subMessage() {
		var freeWithPlan = this.props.cart && this.props.cart.hasLoadedFromServer && this.props.cart.next_domain_is_free && ! this.props.isFinalPrice;
		if ( freeWithPlan ) {
			return <span className="domain-product-price__free-text">{ this.translate( 'Free with your plan' ) }</span>;
		} else {
			if ( domainsWithPlansOnlyTestEnabled && this.props.price ) {
						return (
							<small className="domain-product-price__premium-text" ref="subMessage">
								{ this.translate( 'Included in WordPress.com Premium' ) }
								<PremiumPopover
									context={ this.refs && this.refs.subMessage }
									bindContextEvents
									position="bottom left" />
							</small>
						);
					}
		}
		return null;
	},
	priceMessage( price ) {
		return this.translate( '%(cost)s {{small}}/year{{/small}}', {
			args: { cost: price },
			components: { small: <small /> }
		} );
	},
	priceText() {
		if ( ! this.props.price ) {
			return this.translate( 'Free' );
		} else if ( domainsWithPlansOnlyTestEnabled && ! this.isFreeWithPlan() ) {
			return null;
		}
		return this.priceMessage( this.props.price );
	},
	isFreeWithPlan() {
		return this.props.cart && this.props.cart.hasLoadedFromServer &&
			this.props.cart.next_domain_is_free && ! this.props.isFinalPrice;
	},
	render: function() {
		const classes = classNames( 'domain-product-price', {
				'is-free-domain': this.isFreeWithPlan(),
				'is-with-plans-only': domainsWithPlansOnlyTestEnabled,
				'is-placeholder': this.props.isLoading
			} );

		if ( this.props.isLoading ) {
			return <div className={ classes }>{ this.translate( 'Loading…' ) }</div>;
		}

		return (
			<div className={ classes }>
				<span className="domain-product-price__price">{ this.priceText() }</span>
				{ this.subMessage() }
			</div>
		);
	}
} );

module.exports = DomainProductPrice;
