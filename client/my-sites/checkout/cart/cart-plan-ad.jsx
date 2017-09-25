/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { PLAN_PREMIUM } from 'lib/plans/constants';
import { isPlan } from 'lib/products-values';
import * as upgradesActions from 'lib/upgrades/actions';
import { isDomainOnlySite } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class CartPlanAd extends Component {
	addToCartAndRedirect = ( event ) => {
		event.preventDefault();
		upgradesActions.addItem( cartItems.premiumPlan( PLAN_PREMIUM, { isFreeTrial: false } ) );
		page( '/checkout/' + this.props.selectedSite.slug );
	};

	shouldDisplayAd = () => {
		const { cart, isDomainOnly, selectedSite } = this.props;
		const domainRegistrations = cartItems.getDomainRegistrations( cart );
		const isDomainPremium = domainRegistrations.length === 1 && get( domainRegistrations[ 0 ], 'extra.premium', false );

		return ! isDomainOnly &&
			cart.hasLoadedFromServer &&
			! cart.hasPendingServerUpdates &&
			! cartItems.hasDomainCredit( cart ) &&
			domainRegistrations.length === 1 &&
			! isDomainPremium &&
			selectedSite &&
			selectedSite.plan &&
			! isPlan( selectedSite.plan );
	};

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
	isDomainOnly: PropTypes.bool,
	selectedSite: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object
	] )
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			isDomainOnly: isDomainOnlySite( state, selectedSiteId )
		};
	}
)( localize( CartPlanAd ) );
