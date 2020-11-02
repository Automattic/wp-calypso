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
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	sites,
	wpForTeamsNotSupportedRedirect,
} from 'calypso/my-sites/controller';
import { shouldShowOfferResetFlow } from 'calypso/lib/plans/config';
import plansV2 from 'calypso/my-sites/plans-v2';

const trackedPage = ( url, ...rest ) => {
	page( url, ...rest, makeLayout, clientRender );
};

export default function () {
	trackedPage( '/plans', siteSelection, wpForTeamsNotSupportedRedirect, sites );
	trackedPage(
		'/plans/compare',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage(
		'/plans/compare/:domain',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage(
		'/plans/features',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage(
		'/plans/features/:domain',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage( '/plans/features/:feature/:domain', features );
	trackedPage(
		'/plans/my-plan',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		sites,
		navigation,
		currentPlan
	);
	trackedPage(
		'/plans/my-plan/:site',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		navigation,
		currentPlan
	);
	trackedPage(
		'/plans/select/:plan/:domain',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		redirectToCheckout
	);

	// This route renders the plans page for both WPcom and Jetpack sites.
	trackedPage(
		'/plans/:intervalType?/:site',
		siteSelection,
		wpForTeamsNotSupportedRedirect,
		navigation,
		plans
	);
	if ( shouldShowOfferResetFlow() ) {
		plansV2(
			'/plans',
			siteSelection,
			wpForTeamsNotSupportedRedirect,
			redirectToPlansIfNotJetpack,
			navigation
		);
	}
}
