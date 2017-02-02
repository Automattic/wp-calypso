/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isDomainOnlySite } from 'state/selectors';
import { isPlan } from 'lib/products-values';
import * as upgradesActions from 'lib/upgrades/actions';
import { PLAN_PREMIUM } from 'lib/plans/constants';

class CartPlanAd extends Component {
	addToCartAndRedirect( event ) {
		event.preventDefault();
		upgradesActions.addItem( cartItems.premiumPlan( PLAN_PREMIUM, { isFreeTrial: false } ) );
		page( '/checkout/' + this.props.selectedSite.slug );
	}

	shouldDisplayAd() {
		const { cart, isDomainOnlySite, selectedSite } = this.props;

		return ! isDomainOnlySite &&
			cart.hasLoadedFromServer &&
			! cartItems.hasDomainCredit( cart ) &&
			cartItems.getDomainRegistrations( cart ).length === 1 &&
			selectedSite &&
			selectedSite.plan &&
			! isPlan( selectedSite.plan );
	}

	render() {
		if ( ! this.shouldDisplayAd() ) {
			return null;
		}

		return (
			<CartAd>
				{
					this.props.translate( 'Get this domain for free when you upgrade to {{strong}}WordPress.com Premium{{/strong}}!', {
						components: { strong: <strong /> }
					} )
				}
				{ ' ' }
				<a href="" onClick={ this.addToCartAndRedirect }>{ this.props.translate( 'Upgrade Now' ) }</a>
			</CartAd>
		);
	}
}

CartPlanAd.propTypes = {
	cart: PropTypes.object.isRequired,
	isDomainOnlySite: PropTypes.bool,
	selectedSite: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object
	] )
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			isDomainOnlySite: isDomainOnlySite( state, selectedSiteId )
		};
	}
)( localize( CartPlanAd ) );
