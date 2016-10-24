/**
 * External dependencies
 */
import { connect } from 'react-redux';
import find from 'lodash/find';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { isPersonal, isPremium, isBusiness } from 'lib/products-values';
import { shouldFetchSitePlans } from 'lib/plans';

const CartPlanDiscountAd = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object,
		sitePlans: React.PropTypes.object
	},

	componentDidMount() {
		this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
	},

	render() {
		const { cart, sitePlans } = this.props;
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

		return (
			<CartAd>
				<strong>
					{ i18n.translate( "You're saving %(discount)s!", {
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
} );

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
)( CartPlanDiscountAd );
