import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	navigation,
	siteSelection,
	sites,
	wpForTeamsP2PlusNotSupportedRedirect,
	p2RedirectToHubPlans,
	stagingSiteNotSupportedRedirect,
} from 'calypso/my-sites/controller';
import { redirectIfInvalidInterval } from 'calypso/my-sites/plans/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackStoragePlans } from 'calypso/my-sites/plans/jetpack-plans/jetpack-storage-plans';
import { jetpackUpsell } from 'calypso/my-sites/plans/jetpack-plans/jetpack-upsell';
import {
	features,
	plans,
	redirectToCheckout,
	redirectToPlans,
	redirectToPlansIfNotJetpack,
} from './controller';
import { currentPlan } from './current-plan/controller';
import { trialExpired, trialUpgradeConfirmation } from './ecommerce-trial/controller';

const trackedPage = ( url, ...rest ) => {
	page( url, ...rest, makeLayout, clientRender );
};

const commonHandlers = [
	siteSelection,
	wpForTeamsP2PlusNotSupportedRedirect,
	stagingSiteNotSupportedRedirect,
];

export default function () {
	trackedPage( '/plans', ...commonHandlers, p2RedirectToHubPlans, sites );
	trackedPage(
		'/plans/compare',
		...commonHandlers,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans
	);
	trackedPage(
		'/plans/compare/:domain',
		...commonHandlers,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans
	);
	trackedPage(
		'/plans/features',
		...commonHandlers,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans
	);
	trackedPage(
		'/plans/features/:domain',
		...commonHandlers,
		navigation,
		p2RedirectToHubPlans,
		redirectToPlans
	);
	trackedPage( '/plans/features/:feature/:domain', stagingSiteNotSupportedRedirect, features );
	trackedPage(
		'/plans/my-plan',
		...commonHandlers,
		sites,
		navigation,
		p2RedirectToHubPlans,
		currentPlan
	);
	trackedPage( '/plans/my-plan/trial-expired/:domain', ...commonHandlers, trialExpired );
	trackedPage(
		'/plans/my-plan/trial-upgraded/:domain',
		...commonHandlers,
		trialUpgradeConfirmation
	);
	trackedPage(
		'/plans/my-plan/:site',
		...commonHandlers,
		navigation,
		p2RedirectToHubPlans,
		currentPlan
	);
	trackedPage(
		'/plans/select/:plan/:domain',
		...commonHandlers,
		p2RedirectToHubPlans,
		redirectToCheckout
	);

	// This is a special plans page just for Jetpack Backup storage plans.
	// It needs to be defined before the other plans pages so that /plans/storage/:site
	// will take precedence over /plans/:intervalType?/:site.
	jetpackStoragePlans( '/plans', ...commonHandlers, redirectToPlansIfNotJetpack, navigation );

	// Upsell page between pricing and checkout pages when purchasing some Jetpack products.
	jetpackUpsell( '/plans', ...commonHandlers, redirectToPlansIfNotJetpack, navigation );

	// This route renders the plans page for both WPcom and Jetpack sites.
	trackedPage(
		'/plans/:intervalType?/:site',
		...commonHandlers,
		redirectIfInvalidInterval,
		p2RedirectToHubPlans,
		navigation,
		plans
	);
	jetpackPlans( '/plans', ...commonHandlers, redirectToPlansIfNotJetpack, navigation );
}
