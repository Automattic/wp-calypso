/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { canRemoveFromCart, cartItems } from 'lib/cart-values';
import { isCredits, isDomainProduct, isGoogleApps, isTheme, isMonthly, isPlan } from 'lib/products-values';
import * as upgradesActions from 'lib/upgrades/actions';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { currentUserHasFlag } from 'state/current-user/selectors';

const getIncludedDomain = cartItems.getIncludedDomain;

export class CartItem extends React.Component {
	removeFromCart = ( event ) => {
		event.preventDefault();
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Remove From Cart Icon', 'Product ID', this.props.cartItem.product_id );
		upgradesActions.removeItem( this.props.cartItem, this.props.domainsWithPlansOnly );
	}

	price() {
		const { cart, cartItem, translate } = this.props;

		if ( typeof cartItem.cost === 'undefined' ) {
			return translate( 'Loading price' );
		}

		if ( cartItem.free_trial ) {
			return this.getFreeTrialPrice();
		}

		if ( cartItems.hasDomainCredit( cart ) && isDomainProduct( cartItem ) && cartItem.cost === 0 ) {
			return this.getDomainPlanPrice( cartItem );
		}

		const cost = cartItem.cost * cartItem.volume;

		return translate( '%(cost)s %(currency)s', {
			args: {
				cost: cost,
				currency: cartItem.currency
			}
		} );
	}

	monthlyPrice() {
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

		return this.props.translate( '(%(monthlyPrice)f %(currency)s x 12 months)', {
			args: {
				monthlyPrice: +( cost / 12 ).toFixed( currency === 'JPY' ? 0 : 2 ),
				currency
			}
		} );
	}

	getDomainPlanPrice( cartItem ) {
		if ( cartItem && cartItem.product_cost ) {
			return (
				<span>
					<span className="cart__free-with-plan">{ cartItem.product_cost } { cartItem.currency }</span>
					<span className="cart__free-text">{ this.props.translate( 'Free with your plan' ) }</span>
				</span>
			);
		}

		return <em>{ this.props.translate( 'Free with your plan' ) }</em>;
	}

	getFreeTrialPrice() {
		const freeTrialText = this.props.translate( 'Free %(days)s Day Trial', {
			args: { days: '14' }
		} );

		return (
			<span>
				{ freeTrialText }
			</span>
		);
	}

	getProductInfo() {
		const domain = this.props.cartItem.meta || ( this.props.selectedSite && this.props.selectedSite.domain );
		let info = null;

		if ( isGoogleApps( this.props.cartItem ) && this.props.cartItem.extra.google_apps_users ) {
			info = this.props.cartItem.extra.google_apps_users.map( user => <div>{ user.email }</div> );
		} else if ( isCredits( this.props.cartItem ) ) {
			info = null;
		} else if ( getIncludedDomain( this.props.cartItem ) ) {
			info = getIncludedDomain( this.props.cartItem );
		} else if ( isTheme( this.props.cartItem ) ) {
			info = this.props.selectedSite && this.props.selectedSite.domain;
		} else {
			info = domain;
		}
		return info;
	}

	render() {
		let name = this.getProductName();
		if ( this.props.cartItem.bill_period && this.props.cartItem.bill_period !== -1 ) {
			if ( isMonthly( this.props.cartItem ) ) {
				name += ' - ' + this.props.translate( 'monthly subscription' );
			} else if ( isTheme( this.props.cartItem ) ) {
				name += ' - ' + this.props.translate( 'never expires' );
			} else {
				name += ' - ' + this.props.translate( 'annual subscription' );
			}
		}

		/*eslint-disable wpcalypso/jsx-classname-namespace*/
		return (
			<li className="cart-item">
				<div className="primary-details">
					<span className="product-name">{ name || this.props.translate( 'Loading…' ) }</span>
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
		/*eslint-enable wpcalypso/jsx-classname-namespace*/
	}

	getProductName() {
		const cartItem = this.props.cartItem;
		const options = {
			count: cartItem.volume,
			args: {
				volume: cartItem.volume,
				productName: cartItem.product_name,
			},
		};

		if ( ! cartItem.volume ) {
			return cartItem.product_name;
		} else if ( cartItem.volume === 1 ) {
			switch ( cartItem.product_slug ) {
				case 'gapps':
					return this.props.translate(
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
					return this.props.translate(
						'%(productName)s (%(volume)s User)',
						'%(productName)s (%(volume)s Users)',
						options
					);

				default:
					return this.props.translate(
						'%(productName)s (%(volume)s Item)',
						'%(productName)s (%(volume)s Items)',
						options
					);
			}
		}
	}

	removeButton() {
		if ( canRemoveFromCart( this.props.cart, this.props.cartItem ) ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return <button className="remove-item noticon noticon-close" onClick={ this.removeFromCart }></button>;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}
	}
}

export default connect(
	state => ( {
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
	} )
)( localize( CartItem ) );
