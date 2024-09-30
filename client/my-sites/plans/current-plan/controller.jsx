import { PLAN_ECOMMERCE_TRIAL_MONTHLY, isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { getSelectedSite, getSelectedPurchase } from 'calypso/state/ui/selectors';
import CurrentPlan from './';

export function currentPlan( context, next ) {
	const state = context.store.getState();

	const selectedSite = getSelectedSite( state );
	const purchase = getSelectedPurchase( state );

	if ( ! selectedSite ) {
		page.redirect( '/plans/' );

		return null;
	}

	const isFreePlan = isFreePlanProduct( selectedSite.plan );
	const currentPlanSlug = selectedSite?.plan?.product_slug ?? '';
	const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const isEntrepreneurTrial = isEcommerceTrial && ! purchase?.isWooExpressTrial;

	// When redirecting from the checkout page, selectedSite's plan hasn't had time to update yet, use success param to
	// to bypass the isFreePlan check here and allow loading of /plans/my-plan.
	if ( ( ! context.query.hasOwnProperty( 'success' ) && isFreePlan ) || isEntrepreneurTrial ) {
		page.redirect( `/plans/${ selectedSite.slug }` );

		return null;
	}

	const product = context.query.product;
	const requestThankYou = context.query.hasOwnProperty( 'thank-you' );

	context.primary = (
		<CurrentPlan path={ context.path } product={ product } requestThankYou={ requestThankYou } />
	);

	next();
}
