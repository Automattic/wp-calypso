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
import { cartItems } from 'lib/cart-values';
import { getDayOfTrial } from 'lib/plans';
import { addItem } from 'lib/upgrades/actions';
import Notice from 'components/notice';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentPlan, isRequestingSitePlans } from 'state/sites/plans/selectors';

const FreeTrialNotice = React.createClass( {
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
			isDataLoading = isRequestingPlans || ! cart.hasLoadedFromServer;

		if ( isDataLoading || ! currentPlan.freeTrial ) {
			return null;
		}

		return (
			<Notice
				status="is-info"
				showDismiss={ false }>
				{
					i18n.translate( 'You are currently on day %(day)d of your %(planName)s trial.', {
						args: {
							day: getDayOfTrial( currentPlan ),
							planName: currentPlan.productName
						}
					} )
				}
				{ ' ' }
				{
					i18n.translate( 'Get a free domain when you {{a}}upgrade{{/a}}.', {
						components: {
							a: <a
								href="#"
								onClick={ this.addPlanAndRedirect } />
						}
					} )
				}
			</Notice>
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
)( FreeTrialNotice );
