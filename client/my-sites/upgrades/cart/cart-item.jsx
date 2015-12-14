/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	canRemoveFromCart = require( 'lib/cart-values' ).canRemoveFromCart,
	cartItems = require( 'lib/cart-values' ).cartItems,
	getIncludedDomain = cartItems.getIncludedDomain,
	isCredits = require( 'lib/products-values' ).isCredits,
	isDomainProduct = require( 'lib/products-values' ).isDomainProduct,
	isGoogleApps = require( 'lib/products-values' ).isGoogleApps,
	upgradesActions = require( 'lib/upgrades/actions' );

module.exports = React.createClass( {
	displayName: 'CartItem',

	removeFromCart: function( event ) {
		event.preventDefault();
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Remove From Cart Icon', 'Product ID', this.props.cartItem.product_id );
		upgradesActions.removeItem( this.props.cartItem );
	},

	price: function() {
		var cost,
			cart = this.props.cart,
			cartItem = this.props.cartItem;

		if ( typeof cartItem.cost === 'undefined' ) {
			return this.translate( 'Loading price' );
		}

		if ( cartItem.free_trial ) {
			return this.getFreeTrialPrice();
		}

		if ( cartItems.hasDomainCredit( cart ) && isDomainProduct( cartItem ) && cartItem.cost === 0 ) {
			return this.getDomainPlanPrice();
		}

		cost = cartItem.cost * cartItem.volume;

		return this.translate( '%(cost)s %(currency)s', {
			args: {
				cost: cost,
				currency: cartItem.currency
			}
		} );
	},

	getDomainPlanPrice: function() {
		return <em>{ this.translate( 'Free with your plan' ) }</em>;
	},

	getFreeTrialPrice: function() {
		var freeTrialText, renewalPrice;

		freeTrialText = this.translate( 'Free %(days)s Day Trial', {
			args: { days: '14' }
		} );

		renewalPrice = this.translate( '(%(cost)s %(currency)s/%(billingPeriod)s)', {
			args: {
				cost: this.props.cartItem.orig_cost,
				currency: this.props.cartItem.currency,
				billingPeriod: 'year'
			}
		} );

		return (
			<span>
				{ freeTrialText }
			</span>
		);
	},

	getProductInfo() {
		var domain = this.props.cartItem.meta || this.props.selectedSite.domain,
			info = null;

		if ( isGoogleApps( this.props.cartItem ) && this.props.cartItem.extra.google_apps_users ) {
			info = this.props.cartItem.extra.google_apps_users.map( user => <div>{ user.email }</div> );
		} else if ( isCredits( this.props.cartItem ) ) {
			info = null
		} else if ( getIncludedDomain( this.props.cartItem ) ) {
			info = getIncludedDomain( this.props.cartItem );
		} else {
			info = domain;
		}
		return info;
	},

	render: function() {
		var name = this.getProductName();

		return (
			<li className="cart-item">
				<div className="primary-details">
					<span className="product-name">{ name || this.translate( 'Loading…' ) }</span>
					<span className="product-domain">{ this.getProductInfo() }</span>
				</div>

				<div className="secondary-details">
					<span className="product-price">
						{ this.price() }
					</span>
					{ this.removeButton() }
				</div>
			</li>
		);
	},

	getProductName: function() {
		var cartItem = this.props.cartItem,
			options = {
				count: cartItem.volume,
				args: {
					volume: cartItem.volume,
					productName: cartItem.product_name
				}
			};

		if ( ! cartItem.volume ) {
			return cartItem.product_name;
		} else if ( cartItem.volume === 1 ) {
			switch ( cartItem.product_slug ) {
				case 'gapps':
					return this.translate(
						'%(productName)s (1 User)', {
							args: {
								productName: cartItem.product_name
							}
						} );

				default:
					return cartItem.product_name;
			}
		} else {
			switch ( cartItem.product_slug ) {
				case 'gapps':
					return this.translate(
						'%(productName)s (%(volume)s User)',
						'%(productName)s (%(volume)s Users)',
						options
					);

				default:
					return this.translate(
						'%(productName)s (%(volume)s Item)',
						'%(productName)s (%(volume)s Items)',
						options
					);
			}
		}
	},

	removeButton: function() {
		if ( canRemoveFromCart( this.props.cart, this.props.cartItem ) ) {
			return <button className="remove-item noticon noticon-close" onClick={ this.removeFromCart }></button>;
		}
	}
} );
