/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { once } from 'lodash';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { hasPlan, getAllCartItems } from 'lib/cart-values/cart-items';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { isPlan } from 'lib/products-values';
import { shouldFetchSitePlans } from 'lib/plans';

export class CartPlanDiscountAd extends Component {
	static propTypes = {
		cart: PropTypes.object,
		translate: PropTypes.func.isRequired,
		sitePlans: PropTypes.object,
	};

	constructor( props ) {
		super( props );
		this.trackPlanDiscountAd = once( this.props.trackPlanDiscountAd );
	}

	componentDidMount() {
		this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
	}

	render() {
		const { cart, translate, sitePlans } = this.props;
		if ( ! sitePlans.hasLoadedFromServer || ! cart.hasLoadedFromServer || ! hasPlan( cart ) ) {
			return null;
		}

		const cartPlan = getAllCartItems( cart ).find( isPlan );
		const plan = sitePlans.data.filter( function ( sitePlan ) {
			return sitePlan.productSlug === this.product_slug;
		}, cartPlan )[ 0 ];

		if ( plan.rawDiscount === 0 || ! plan.isDomainUpgrade ) {
			return null;
		}

		this.trackPlanDiscountAd();

		return (
			<CartAd>
				<p className="cart__cart-plan-discount-ad-paragraph">
					{ translate(
						"You're getting a %(discount)s discount off the regular price of the plan (%(originalPrice)s)" +
							', because you already paid for the domain.',
						{
							args: {
								discount: plan.formattedDiscount,
								originalPrice: plan.formattedOriginalPrice,
							},
						}
					) }
				</p>
			</CartAd>
		);
	}
}

export default connect(
	( state, { selectedSite } ) => {
		return {
			sitePlans: getPlansBySite( state, selectedSite ),
		};
	},
	( dispatch ) => {
		return {
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			},
			trackPlanDiscountAd: () => {
				dispatch( recordTracksEvent( 'cart_plan_discount_ad' ) );
			},
		};
	}
)( localize( CartPlanDiscountAd ) );
