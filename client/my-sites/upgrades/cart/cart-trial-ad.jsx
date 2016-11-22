/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartAd from './cart-ad';
import { cartItems } from 'lib/cart-values';
import { getDayOfTrial } from 'lib/plans';
import { addItem } from 'lib/upgrades/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentPlan, isRequestingSitePlans } from 'state/sites/plans/selectors';

const CartTrialAd = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		// connected props
		currentPlan: React.PropTypes.object,
		isRequestingSitePlans: React.PropTypes.bool,
		selectedSiteSlug: React.PropTypes.string
	},

	addPlanAndRedirect( event ) {
		event.preventDefault();
		addItem( cartItems.planItem( this.props.currentPlan.productSlug ) );
		page( `/checkout/${ this.props.selectedSiteSlug }` );
	},

	render() {
		const { cart, currentPlan, isRequestingSitePlans: isRequestingPlans } = this.props,
			isDataLoading = isRequestingPlans || ! cart.hasLoadedFromServer;

		if ( isDataLoading ||
			! currentPlan.freeTrial ||
			cartItems.getDomainRegistrations( cart ).length !== 1 ||
			cartItems.hasPlan( cart ) ) {
			return null;
		}

		return (
			<CartAd>
				{
					i18n.translate( 'You are currently on day %(days)d of your {{strong}}%(planName)s trial{{/strong}}.', {
						components: { strong: <strong /> },
						args: {
							days: getDayOfTrial( currentPlan ),
							planName: currentPlan.productName
						}
					} )
				}
				{ ' ' }
				{
					i18n.translate( 'Get this domain for free when you upgrade.' )
				}
				{ ' ' }
				<a
					href="#"
					onClick={ this.addPlanAndRedirect }>
						{ i18n.translate( 'Upgrade Now' ) }
				</a>
			</CartAd>
		);
	}
} );

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
			selectedSiteSlug: getSiteSlug( state, selectedSiteId )
		};
	}
)( CartTrialAd );
