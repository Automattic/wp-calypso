/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var PremiumPopover = require( 'components/plans/premium-popover' ),
	cartItems = require( 'lib/cart-values/cart-items' ),
	sitesList = require( 'lib/sites-list' )(),
	isPlan = require( 'lib/products-values' ).isPlan,
	abtest = require( 'lib/abtest' ).abtest;

const domainsWithPlansOnlyTestEnabled = abtest( 'domainsWithPlansOnly' ) === 'plansOnly';
const personalPlanTestEnabled = abtest( 'personalPlan' ) === 'show';

var DomainProductPrice = React.createClass( {
	shouldShowPremiumMessage: function() {
		const selectedSite = sitesList.getSelectedSite();
		return domainsWithPlansOnlyTestEnabled && ! ( selectedSite && isPlan( selectedSite.plan ) ) && this.props.price;
	},
	subMessage() {
		var freeWithPlan = this.props.cart && this.props.cart.hasLoadedFromServer && this.props.cart.next_domain_is_free && ! this.props.isFinalPrice;
		if ( freeWithPlan ) {
			return <span className="domain-product-price__free-text">{ this.translate( 'Free with your plan' ) }</span>;
		} else if ( this.shouldShowPremiumMessage() ) {
			return (
				<small className="domain-product-price__premium-text" ref="subMessage">
					{ personalPlanTestEnabled ? this.translate( 'Included in WordPress.com Upgrades' ) : this.translate( 'Included in WordPress.com Premium' ) }
					{ personalPlanTestEnabled ||
						<PremiumPopover
							context={ this.refs && this.refs.subMessage }
							bindContextEvents
							position="bottom left"/>
					}
				</small>
			);
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
		const selectedSite = sitesList.getSelectedSite();
		if ( ! this.props.price ) {
			return this.translate( 'Free' );
		} else if ( domainsWithPlansOnlyTestEnabled && ! cartItems.isNextDomainFree( this.props.cart ) && ( ! selectedSite || ! isPlan( selectedSite.plan ) ) ) {
			return null;
		}
		return this.priceMessage( this.props.price );
	},
	render: function() {
		const classes = classNames( 'domain-product-price', {
			'is-free-domain': cartItems.isNextDomainFree( this.props.cart ),
			'is-with-plans-only': this.shouldShowPremiumMessage(),
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
