/**
 * External dependencies
 */
import { connect } from 'react-redux';
import find from 'lodash/find';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { isPersonal, isPremium, isBusiness } from 'lib/products-values';
import { shouldFetchSitePlans } from 'lib/plans';

class CartPlanDiscountAd extends Component {
	static propTypes = {
		cart: PropTypes.object,
		translate: PropTypes.func.isRequired,
		sitePlans: PropTypes.object
	};

	componentDidMount() {
		this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
	}

	render() {
		const { cart, translate, sitePlans } = this.props;
		let plan;

		if ( ! sitePlans.hasLoadedFromServer || ! cart.hasLoadedFromServer || ! cartItems.hasPlan( cart ) ) {
			return null;
		}

		if ( cartItems.getAll( cart ).some( isPersonal ) ) {
			plan = find( sitePlans.data, isPersonal );
		}

		if ( cartItems.getAll( cart ).some( isPremium ) ) {
			plan = find( sitePlans.data, isPremium );
		}

		if ( cartItems.getAll( cart ).some( isBusiness ) ) {
			plan = find( sitePlans.data, isBusiness );
		}

		if ( plan.rawDiscount === 0 ) {
			return null;
		}

		if ( plan.isDomainUpgrade ) {
			return (
				<CartAd>
					<p className="cart__cart-plan-discount-ad-paragraph">{ translate(
						"You're getting a %(discount)s discount off the regular price of the plan (%(originalPrice)s)" +
						', because you already paid for the domain.',
						{
							args: {
								discount: plan.formattedDiscount,
								originalPrice: plan.formattedOriginalPrice
							}
						}
					) }</p>
					<p className="cart__cart-plan-discount-ad-paragraph">{ translate(
						'The plan and the domain can be renewed together for %(originalPrice)s / year.',
						{
							args: {
								originalPrice: plan.formattedOriginalPrice
							}
						}
					) }</p>
				</CartAd>
			);
		}

		return (
			<CartAd>
				<strong>
					{ translate( "You're saving %(discount)s!", {
						args: {
							discount: plan.formattedDiscount
						}
					} ) }
				</strong>
				{ ' ' }
				{ plan.discountReason }
			</CartAd>
		);
	}
}

export default connect(
	( state, { selectedSite } ) => {
		return {
			sitePlans: getPlansBySite( state, selectedSite )
		};
	},
	( dispatch ) => {
		return {
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( localize( CartPlanDiscountAd ) );
