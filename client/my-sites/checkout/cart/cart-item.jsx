/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { canRemoveFromCart, cartItems } from 'lib/cart-values';
import {
	isCredits,
	isGoogleApps,
	isTheme,
	isMonthly,
	isPlan,
	isBundled,
} from 'lib/products-values';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { removeItem } from 'lib/upgrades/actions';
import { localize } from 'i18n-calypso';

const getIncludedDomain = cartItems.getIncludedDomain;

export class CartItem extends React.Component {
	removeFromCart = event => {
		event.preventDefault();
		analytics.ga.recordEvent(
			'Upgrades',
			'Clicked Remove From Cart Icon',
			'Product ID',
			this.props.cartItem.product_id
		);
		removeItem( this.props.cartItem, this.props.domainsWithPlansOnly );
	};

	price() {
		const { cartItem, translate } = this.props;

		if ( typeof cartItem.cost === 'undefined' ) {
			return translate( 'Loading price' );
		}

		if ( cartItem.free_trial ) {
			return this.getFreeTrialPrice();
		}

		if ( isBundled( cartItem ) && cartItem.cost === 0 ) {
			return this.getDomainPlanPrice( cartItem );
		}

		const cost = cartItem.cost * cartItem.volume;

		return translate( '%(cost)s %(currency)s', {
			args: {
				cost: cost,
				currency: cartItem.currency,
			},
		} );
	}

	monthlyPrice() {
		const { cartItem, translate } = this.props;
		const { cost, currency } = cartItem;

		if ( typeof cost === 'undefined' ) {
			return null;
		}

		if ( ! isPlan( cartItem ) ) {
			return null;
		}

		if ( cost <= 0 ) {
			return null;
		}

		if ( isMonthly( cartItem ) ) {
			return null;
		}

		return translate( '(%(monthlyPrice)f %(currency)s x 12 months)', {
			args: {
				monthlyPrice: +( cost / 12 ).toFixed( currency === 'JPY' ? 0 : 2 ),
				currency,
			},
		} );
	}

	getDomainPlanPrice( cartItem ) {
		const { translate } = this.props;

		if ( cartItem && cartItem.product_cost ) {
			return (
				<span>
					<span className="cart__free-with-plan">
						{ cartItem.product_cost } { cartItem.currency }
					</span>
					<span className="cart__free-text">{ translate( 'Free with your plan' ) }</span>
				</span>
			);
		}

		return <em>{ translate( 'Free with your plan' ) }</em>;
	}

	getFreeTrialPrice() {
		const freeTrialText = this.props.translate( 'Free %(days)s Day Trial', {
			args: { days: '14' },
		} );

		return <span>{ freeTrialText }</span>;
	}

	getProductInfo() {
		const { cartItem, selectedSite } = this.props;

		const domain = cartItem.meta || ( selectedSite && selectedSite.domain );
		let info = null;

		if ( isGoogleApps( cartItem ) && cartItem.extra.google_apps_users ) {
			info = cartItem.extra.google_apps_users.map( user => <div>{ user.email }</div> );
		} else if ( isCredits( cartItem ) ) {
			info = null;
		} else if ( getIncludedDomain( cartItem ) ) {
			info = getIncludedDomain( cartItem );
		} else if ( isTheme( cartItem ) ) {
			info = selectedSite && selectedSite.domain;
		} else {
			info = domain;
		}
		return info;
	}

	render() {
		const { cartItem, translate } = this.props;

		let name = this.getProductName();
		if ( cartItem.bill_period && parseInt( cartItem.bill_period ) !== -1 ) {
			if ( isMonthly( cartItem ) ) {
				name += ' - ' + translate( 'monthly subscription' );
			} else {
				name += ' - ' + translate( 'annual subscription' );
			}
		}

		if ( isTheme( cartItem ) ) {
			name += ' - ' + translate( 'never expires' );
		}

		/*eslint-disable wpcalypso/jsx-classname-namespace*/
		return (
			<li className="cart-item">
				<div className="primary-details">
					<span className="product-name">{ name || translate( 'Loading…' ) }</span>
					<span className="product-domain">{ this.getProductInfo() }</span>
				</div>

				<div className="secondary-details">
					<span className="product-price">{ this.price() }</span>
					<span className="product-monthly-price">{ this.monthlyPrice() }</span>
					{ this.removeButton() }
				</div>
			</li>
		);
		/*eslint-enable wpcalypso/jsx-classname-namespace*/
	}

	getProductName() {
		const { cartItem, translate } = this.props;
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
					return translate( '%(productName)s (1 User)', {
						args: {
							productName: cartItem.product_name,
						},
					} );

				default:
					return cartItem.product_name;
			}
		} else {
			switch ( cartItem.product_slug ) {
				case 'gapps':
					return translate(
						'%(productName)s (%(volume)s User)',
						'%(productName)s (%(volume)s Users)',
						options
					);

				default:
					return translate(
						'%(productName)s (%(volume)s Item)',
						'%(productName)s (%(volume)s Items)',
						options
					);
			}
		}
	}

	removeButton() {
		const { cart, cartItem } = this.props;

		if ( canRemoveFromCart( cart, cartItem ) ) {
			return (
				<button className="remove-item" onClick={ this.removeFromCart }>
					<Gridicon icon="cross-small" />
				</button>
			);
		}
	}
}

export default connect( state => ( {
	domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
} ) )( localize( CartItem ) );
