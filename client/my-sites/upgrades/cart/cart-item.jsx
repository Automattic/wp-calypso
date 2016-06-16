/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { canRemoveFromCart, cartItems } from 'lib/cart-values';
import {
	isCredits,
	isDomainProduct,
	isGoogleApps,
	isTheme,
	isMonthly,
	isPlan
} from 'lib/products-values';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { DWPO } from 'state/current-user/constants';
import * as upgradesActions from 'lib/upgrades/actions';

const getIncludedDomain = cartItems.getIncludedDomain;

const CartItem = React.createClass( {

	removeFromCart: function( event ) {
		event.preventDefault();
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Remove From Cart Icon', 'Product ID', this.props.cartItem.product_id );
		upgradesActions.removeItem( this.props.cartItem, this.props.domainsWithPlansOnly );
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

	monthlyPrice: function() {
		const { cost, currency } = this.props.cartItem;

		if ( typeof cost === 'undefined' ) {
			return null;
		}

		if ( ! isPlan( this.props.cartItem ) ) {
			return null;
		}

		if ( cost <= 0 ) {
			return null;
		}

		if ( isMonthly( this.props.cartItem ) ) {
			return null;
		}

		return this.translate( '(%(monthlyPrice)f %(currency)s x 12 months)', {
			args: {
				monthlyPrice: +( cost / 12 ).toFixed( currency === 'JPY' ? 0 : 2 ),
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
			info = null;
		} else if ( getIncludedDomain( this.props.cartItem ) ) {
			info = getIncludedDomain( this.props.cartItem );
		} else if ( isTheme( this.props.cartItem ) ) {
			info = this.props.selectedSite.domain;
		} else {
			info = domain;
		}
		return info;
	},

	render: function() {
		var name = this.getProductName();
		if ( this.props.cartItem.bill_period && this.props.cartItem.bill_period !== -1 ) {
			if ( isMonthly( this.props.cartItem ) ) {
				name += ' - ' + this.translate( 'monthly subscription' );
			} else {
				name += ' - ' + this.translate( 'annual subscription' );
			}
		}

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
					<span className="product-monthly-price">
						{ this.monthlyPrice() }
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

export default connect( state => ( { domainsWithPlansOnly: currentUserHasFlag( state, DWPO ) } ) )( CartItem );
