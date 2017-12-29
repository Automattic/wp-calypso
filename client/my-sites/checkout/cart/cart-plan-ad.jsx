/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isDomainOnlySite } from 'state/selectors';
import { isPlan } from 'lib/products-values';
import { addItem } from 'lib/upgrades/actions';
import { PLAN_PREMIUM } from 'lib/plans/constants';

class CartPlanAd extends Component {
	addToCartAndRedirect = event => {
		event.preventDefault();
		addItem( cartItems.premiumPlan( PLAN_PREMIUM, { isFreeTrial: false } ) );
		page( '/checkout/' + this.props.selectedSite.slug );
	};

	shouldDisplayAd = () => {
		const { cart, isDomainOnly, selectedSite } = this.props;
		const domainRegistrations = cartItems.getDomainRegistrations( cart );
		const isDomainPremium =
			domainRegistrations.length === 1 && get( domainRegistrations[ 0 ], 'extra.premium', false );

		return (
			! isDomainOnly &&
			cart.hasLoadedFromServer &&
			! cart.hasPendingServerUpdates &&
			! cartItems.hasDomainCredit( cart ) &&
			domainRegistrations.length === 1 &&
			! isDomainPremium &&
			selectedSite &&
			selectedSite.plan &&
			! isPlan( selectedSite.plan )
		);
	};

	render() {
		if ( ! this.shouldDisplayAd() ) {
			return null;
		}

		return (
			<CartAd>
				{ this.props.translate(
					'Get this domain for free when you upgrade to {{strong}}WordPress.com Premium{{/strong}}!',
					{
						components: { strong: <strong /> },
					}
				) }{' '}
				<a href="" onClick={ this.addToCartAndRedirect }>
					{ this.props.translate( 'Upgrade Now' ) }
				</a>
			</CartAd>
		);
	}
}

CartPlanAd.propTypes = {
	cart: PropTypes.object.isRequired,
	isDomainOnly: PropTypes.bool,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		isDomainOnly: isDomainOnlySite( state, selectedSiteId ),
	};
} )( localize( CartPlanAd ) );
