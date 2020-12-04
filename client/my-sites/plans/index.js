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
	wpForTeamsP2PlusNotSupportedRedirect,
} from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';

const trackedPage = ( url, ...rest ) => {
	page( url, ...rest, makeLayout, clientRender );
};

export default function () {
	trackedPage( '/plans', siteSelection, wpForTeamsP2PlusNotSupportedRedirect, sites );
	trackedPage(
		'/plans/compare',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage(
		'/plans/compare/:domain',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage(
		'/plans/features',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage(
		'/plans/features/:domain',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		redirectToPlans
	);
	trackedPage( '/plans/features/:feature/:domain', features );
	trackedPage(
		'/plans/my-plan',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		sites,
		navigation,
		currentPlan
	);
	trackedPage(
		'/plans/my-plan/:site',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		currentPlan
	);
	trackedPage(
		'/plans/select/:plan/:domain',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		redirectToCheckout
	);

	// This route renders the plans page for both WPcom and Jetpack sites.
	trackedPage(
		'/plans/:intervalType?/:site',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		navigation,
		plans
	);
	jetpackPlans(
		'/plans',
		siteSelection,
		wpForTeamsP2PlusNotSupportedRedirect,
		redirectToPlansIfNotJetpack,
		navigation
	);
}
