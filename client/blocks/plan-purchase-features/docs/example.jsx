/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PlanPurchaseFeatures from '../';
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY
} from 'lib/plans/constants';
import { getCurrentUser } from 'state/current-user/selectors';
import QuerySites from 'components/data/query-sites';
import { getSite } from 'state/sites/selectors';

class PlanPurchaseFeaturesExample extends Component {
	renderPlanPurchaseFeatures() {
		const { selectedSite } = this.props;
		
		return (
			<div className="docs__design-assets-group">
				<h2>
					<a href="/devdocs/blocks/plan-purchase-features-example">Plan Purchase Features</a>
				</h2>
				
				<h2>Business Plan</h2>
				<PlanPurchaseFeatures plan={ PLAN_BUSINESS } selectedSite={ selectedSite } />

				<h2>Premium Plan</h2>
				<PlanPurchaseFeatures plan={ PLAN_PREMIUM } selectedSite={ selectedSite } />

				<h2>Personal Plan</h2>
				<PlanPurchaseFeatures plan={ PLAN_PERSONAL } selectedSite={ selectedSite } />

				<h2>Jetpack Free</h2>
				<PlanPurchaseFeatures plan={ PLAN_JETPACK_FREE } selectedSite={ selectedSite } />

				<h2>Jetpack Premium</h2>
				<PlanPurchaseFeatures plan={ PLAN_JETPACK_PREMIUM } selectedSite={ selectedSite } />

				<h2>Jetpack Business</h2>
				<PlanPurchaseFeatures plan={ PLAN_JETPACK_BUSINESS } selectedSite={ selectedSite } />

				<h2>Jetpack Premium Monthly</h2>
				<PlanPurchaseFeatures plan={ PLAN_JETPACK_PREMIUM_MONTHLY } selectedSite={ selectedSite } />

				<h2>Jetpack Business Monthly</h2>
				<PlanPurchaseFeatures plan={ PLAN_JETPACK_BUSINESS_MONTHLY } selectedSite={ selectedSite } />
			</div>
		);
	}
	
	render() {
		const { primarySiteId, selectedSite } = this.props;
		
		return (
			<div>
				{ primarySiteId && <QuerySites siteId={ primarySiteId } /> }

				{ selectedSite && this.renderPlanPurchaseFeatures() }
			</div>
		);
	}
}

const ConnectedPlanPurchaseFeaturesExample = connect( state => {
	const user = getCurrentUser( state );

	if ( ! user ) {
		return {}
	}
	
	const primarySiteId = user.primary_blog;

	return {
		primarySiteId,
		selectedSite: getSite( state, primarySiteId )
	}
} )( PlanPurchaseFeaturesExample );

ConnectedPlanPurchaseFeaturesExample.displayName = 'PlanPurchaseFeaturesExample';

export default ConnectedPlanPurchaseFeaturesExample;

