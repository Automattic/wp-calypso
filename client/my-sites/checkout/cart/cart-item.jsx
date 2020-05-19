/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { withLocalizedMoment } from 'components/localized-moment';
import { gaRecordEvent } from 'lib/analytics/ga';
import { canRemoveFromCart } from 'lib/cart-values';
import { getIncludedDomain } from 'lib/cart-values/cart-items';
import {
	isCredits,
	isGoogleApps,
	isTheme,
	isMonthly,
	isYearly,
	isBiennially,
	isPlan,
	isBundled,
	isDomainProduct,
} from 'lib/products-values';
import { isGSuiteProductSlug } from 'lib/gsuite';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG } from 'lib/gsuite/constants';
import { removeItem } from 'lib/cart/actions';
import { localize } from 'i18n-calypso';
import { calculateMonthlyPriceForPlan, getBillingMonthsForPlan } from 'lib/plans';

export class CartItem extends React.Component {
	removeFromCart = ( event ) => {
		event.preventDefault();
		gaRecordEvent(
			'Upgrades',
			'Clicked Remove From Cart Icon',
			'Product ID',
			this.props.cartItem.product_id
		);
		removeItem( this.props.cartItem, this.props.domainsWithPlansOnly );
	};

	price() {
		const { cart, cartItem, translate } = this.props;

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

		if ( 0 === cost ) {
			return <span className="cart__free-text">{ translate( 'Free' ) }</span>;
		}

		if ( isGSuiteProductSlug( cartItem.product_slug ) ) {
			const {
				cost_before_coupon: costPerProductBeforeCoupon,
				is_sale_coupon_applied: isSaleCouponApplied,
			} = cartItem;
			const costBeforeCoupon = costPerProductBeforeCoupon * cartItem.volume;

			if ( isSaleCouponApplied ) {
				const { is_coupon_applied: isCouponApplied } = cart;

				return (
					<div className="cart__gsuite-discount">
						<span className="cart__gsuite-discount-regular-price">{ costBeforeCoupon }</span>

						<span className="cart__gsuite-discount-discounted-price">
							{ cost } { cartItem.currency }
						</span>

						<span className="cart__gsuite-discount-text">
							{ isCouponApplied
								? translate( 'Discounts applied' )
								: translate( 'Discount for first year' ) }
						</span>
					</div>
				);
			}
		}

		return translate( '%(cost)s %(currency)s', {
			args: {
				cost: cost,
				currency: cartItem.currency,
			},
		} );
	}

	monthlyPrice() {
		const { cartItem, translate } = this.props;
		const { currency } = cartItem;

		if ( ! this.monthlyPriceApplies() ) {
			return null;
		}

		const { months, monthlyPrice } = this.calcMonthlyBillingDetails();
		const price = getCurrencyObject( monthlyPrice, currency );

		return translate( '(%(monthlyPrice)s %(currency)s x %(months)d months)', {
			args: {
				months,
				currency,
				monthlyPrice: `${ price.integer }${
					monthlyPrice - price.integer > 0 ? price.fraction : ''
				}`,
			},
		} );
	}

	monthlyPriceApplies() {
		const { cartItem } = this.props;
		const { cost } = cartItem;

		if ( ! isPlan( cartItem ) ) {
			return false;
		}

		if ( isMonthly( cartItem ) ) {
			return false;
		}

		const hasValidPrice = typeof cost !== 'undefined' && cost > 0;
		if ( ! hasValidPrice ) {
			return false;
		}

		return true;
	}

	calcMonthlyBillingDetails() {
		const { cost, product_slug } = this.props.cartItem;
		return {
			monthlyPrice: calculateMonthlyPriceForPlan( product_slug, cost ),
			months: getBillingMonthsForPlan( product_slug ),
		};
	}

	getDomainPlanPrice( cartItem ) {
		const { translate } = this.props;

		if ( cartItem && cartItem.product_cost ) {
			return (
				<span>
					<span className="cart__free-with-plan">
						{ cartItem.product_cost } { cartItem.currency }
					</span>
					<span className="cart__free-text">{ translate( 'First year free with your plan' ) }</span>
				</span>
			);
		}

		return <em>{ translate( 'First year free with your plan' ) }</em>;
	}

	getFreeTrialPrice() {
		const freeTrialText = this.props.translate( 'Free %(days)s Day Trial', {
			args: { days: '14' },
		} );

		return <span>{ freeTrialText }</span>;
	}

	getProductInfo() {
		const { cartItem, selectedSite } = this.props;
		const domain =
			cartItem.meta ||
			get( cartItem, 'extra.domain_to_bundle' ) ||
			( selectedSite && selectedSite.domain );
		let info = null;

		if ( isGoogleApps( cartItem ) && cartItem.extra.google_apps_users ) {
			info = cartItem.extra.google_apps_users.map( ( user ) => (
				<div key={ `user-${ user.email }` }>{ user.email }</div>
			) );
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

	getDomainRenewalExpiryDate() {
		const { cartItem } = this.props;

		return (
			get( cartItem, 'is_domain_registration' ) &&
			get( cartItem, 'is_renewal' ) &&
			get( cartItem, 'domain_post_renewal_expiration_date' )
		);
	}

	renderDomainRenewalExpiryDate() {
		const domainRenewalExpiryDate = this.getDomainRenewalExpiryDate();

		if ( ! domainRenewalExpiryDate ) {
			return null;
		}

		const { moment, translate } = this.props;
		const domainRenewalExpiryDateText = translate( 'Renew until %(renewalDate)s', {
			args: {
				renewalDate: moment( domainRenewalExpiryDate ).format( 'LL' ),
			},
		} );

		/*eslint-disable wpcalypso/jsx-classname-namespace*/
		return <span className="product-domain-renewal-date">{ domainRenewalExpiryDateText }</span>;
		/*eslint-enable wpcalypso/jsx-classname-namespace*/
	}

	render() {
		const { cartItem, translate } = this.props;

		let name = this.getProductName();
		const subscriptionLength = this.getSubscriptionLength();
		if ( subscriptionLength ) {
			name += ' - ' + subscriptionLength;
		}

		if ( isTheme( cartItem ) ) {
			name += ' - ' + translate( 'never expires' );
		}

		/*eslint-disable wpcalypso/jsx-classname-namespace*/
		return (
			<li className="cart-item">
				<div className="primary-details">
					<span className="product-name" data-e2e-product-slug={ cartItem.product_slug }>
						{ name || translate( 'Loading…' ) }
					</span>
					<span className="product-domain">{ this.getProductInfo() }</span>
					{ this.renderDomainRenewalExpiryDate() }
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

	getSubscriptionLength() {
		const { cartItem, translate } = this.props;
		if ( this.isDomainProductDiscountedTo0() ) {
			return false;
		}

		const hasBillPeriod = cartItem.bill_period && parseInt( cartItem.bill_period ) !== -1;
		if ( ! hasBillPeriod ) {
			return false;
		}

		if ( isMonthly( cartItem ) ) {
			return translate( 'monthly subscription' );
		} else if ( isYearly( cartItem ) ) {
			return translate( 'annual subscription' );
		} else if ( isBiennially( cartItem ) ) {
			return translate( 'two year subscription' );
		}

		return false;
	}

	isDomainProductDiscountedTo0() {
		const { cartItem } = this.props;
		return isDomainProduct( cartItem ) && isBundled( cartItem ) && cartItem.cost === 0;
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
				case GSUITE_BASIC_SLUG:
				case GSUITE_BUSINESS_SLUG:
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
				case GSUITE_BASIC_SLUG:
				case GSUITE_BUSINESS_SLUG:
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
		const { cart, cartItem, translate } = this.props;
		const labelText = translate( 'Remove item' );

		if ( canRemoveFromCart( cart, cartItem ) ) {
			return (
				<button
					className="cart__remove-item"
					onClick={ this.removeFromCart }
					aria-label={ labelText }
					title={ labelText }
				>
					<Gridicon icon="trash" size={ 24 } />
				</button>
			);
		}
	}
}

export default connect( ( state ) => ( {
	domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
} ) )( localize( withLocalizedMoment( CartItem ) ) );
