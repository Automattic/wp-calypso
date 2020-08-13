/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	features,
	plans,
	redirectToCheckout,
	redirectToPlans,
	redirectToPlansIfNotJetpack,
} from './controller';
import { currentPlan } from './current-plan/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { shouldShowOfferResetFlow } from 'lib/abtest/getters';
import plansV2 from 'my-sites/plans-v2';

const trackedPage = ( url, ...rest ) => {
	page( url, ...rest, makeLayout, clientRender );
};

export default function () {
	trackedPage( '/plans', siteSelection, sites );
	trackedPage( '/plans/compare', siteSelection, navigation, redirectToPlans );
	trackedPage( '/plans/compare/:domain', siteSelection, navigation, redirectToPlans );
	trackedPage( '/plans/features', siteSelection, navigation, redirectToPlans );
	trackedPage( '/plans/features/:domain', siteSelection, navigation, redirectToPlans );
	trackedPage( '/plans/features/:feature/:domain', features );
	trackedPage( '/plans/my-plan', siteSelection, sites, navigation, currentPlan );
	trackedPage( '/plans/my-plan/:site', siteSelection, navigation, currentPlan );
	trackedPage( '/plans/select/:plan/:domain', siteSelection, redirectToCheckout );

	// This route renders the plans page for both WPcom and Jetpack sites.
	trackedPage( '/plans/:intervalType?/:site', siteSelection, navigation, plans );
	if ( shouldShowOfferResetFlow() ) {
		plansV2( '/plans/:site', siteSelection, redirectToPlansIfNotJetpack, navigation );
	}
}
