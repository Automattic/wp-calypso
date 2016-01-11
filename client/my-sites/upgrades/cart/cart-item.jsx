/**
 * External dependencies
 */
var React = require( 'react' ),
	range = require( 'lodash/utility/range' );

/**
 * Internal dependencies
 */
var analyticsMixin = require( 'lib/mixins/analytics' ),
	canRemoveFromCart = require( 'lib/cart-values' ).canRemoveFromCart,
	config = require( 'config' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	getIncludedDomain = cartItems.getIncludedDomain,
	isCredits = require( 'lib/products-values' ).isCredits,
	isDomainProduct = require( 'lib/products-values' ).isDomainProduct,
	isGoogleApps = require( 'lib/products-values' ).isGoogleApps,
	upgradesActions = require( 'lib/upgrades/actions' ),
	abtest = require( 'lib/abtest' ).abtest,
	{ isPremium, isBusiness, isDomainRegistration } = require( 'lib/products-values' ),
	isTheme = require( 'lib/products-values' ).isTheme;

module.exports = React.createClass( {
	displayName: 'CartItem',

	mixins: [ analyticsMixin( 'cartItem' ) ],

	removeFromCart: function( event ) {
		event.preventDefault();
		this.recordEvent( 'remove', this.props.cartItem.product_id );
		upgradesActions.removeItem( this.props.cartItem );
	},

	isBundlePlanApplied() {
		var { cart, cartItem } = this.props;
		return cartItems.hasDomainCredit( cart ) && isDomainProduct( cartItem ) && cartItem.cost === 0
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

		if ( this.isBundlePlanApplied() ) {
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

	monthlyPrice: function() {
		const { cost, currency } = this.props.cartItem,
			isInSignup = this.props.cartItem.extra && this.props.cartItem.extra.context === 'signup';
		if ( ! isInSignup ||
				! ( isPremium( this.props.cartItem ) || isBusiness( this.props.cartItem ) ) ||
				abtest( 'monthlyPlanPricing' ) === 'yearly' ||
				cost === 0 ) {
			return null;
		}

		return this.translate( '(%(monthlyPrice)f %(currency)s x 12 months)', {
			args: {
				monthlyPrice: +( cost / 12 ).toFixed( 2 ),
				currency
			}
		} );
	},

	getDomainPlanPrice: function() {
		return <em>{ this.translate( 'Free with your plan' ) }</em>;
	},

	getFreeTrialPrice: function() {
		var freeTrialText;

		freeTrialText = this.translate( 'Free %(days)s Day Trial', {
			args: { days: '14' }
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
		} else if ( isTheme( this.props.cartItem ) ) {
			info = this.props.selectedSite.domain;
		} else {
			info = domain;
		}
		return info;
	},

	handleDomainVolumeSelection: function( event ) {
		event.preventDefault();
		const volume = parseInt( event.target.value, 10 );
		upgradesActions.setVolume( this.props.cartItem, volume );

		this.recordEvent( 'changeVolume', volume );
	},

	getVolumeOptions: function() {
		// present 1-year to 5-year subscriptions
		return range( 1, 6 ).map( number =>
			<option key={ number } value={ number }>
				{ this.translate( '%(number)s year', '%(number)s years', { args: { number }, count: number } ) }
			</option>
		);
	},

	render: function() {
		const multiYearEnabled = config.isEnabled( 'upgrades/cart/multi-year-domain' ),
			showVolumeSelection = multiYearEnabled && isDomainRegistration( this.props.cartItem ) &&
				( ! this.isBundlePlanApplied() || ! this.props.cartItem.free_trial );

		return (
			<li className="cart-item">
				<div className="primary-details">
					<span className="product-name">{ this.getProductName() || this.translate( 'Loading…' ) }</span>
					<span className="product-domain">{ this.getProductInfo() }</span>
				</div>

				<div className="secondary-details">
					<span className="product-price">
						{ this.price() }
					</span>
					<span className="product-monthly-price">
						{ this.monthlyPrice() }
					</span>
					{ showVolumeSelection && <select
						name="product-domain-volume"
						className="product-domain-volume"
						onChange={ this.handleDomainVolumeSelection }
						value={ this.props.cartItem.volume }>
						{ this.getVolumeOptions() }
					</select>
					}
					{ ! isCredits( this.props.cartItem ) && this.removeButton() }
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
			},
			hasDomainSuffix, gappsProductName;
		if ( isDomainRegistration( cartItem ) ) {
			return cartItem.product_name;
		}
		if ( ! cartItem.volume ) {
			return cartItem.product_name;
		} else if ( cartItem.volume === 1 ) {
			switch ( cartItem.product_slug ) {
				case 'gapps':
					hasDomainSuffix = cartItem.product_name.includes( cartItem.meta );
					gappsProductName = hasDomainSuffix ? cartItem.product_name : this.translate(
						'%(productName)s for %(domain)s', {
							args: {
								productName: cartItem.product_name,
								domain: cartItem.meta
							}
						} );
					return this.translate(
						'%(productName)s (1 User)', {
							args: {
								productName: gappsProductName
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

				case 'private_whois':
					return this.translate(
						'%(productName)s (%(volume)s Year)',
						'%(productName)s (%(volume)s Years)',
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
