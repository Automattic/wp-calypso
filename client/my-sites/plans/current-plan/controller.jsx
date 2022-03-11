import { isFreePlanProduct, isFlexiblePlanProduct } from '@automattic/calypso-products';
import page from 'page';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CurrentPlan from './';

export function currentPlan( context, next ) {
	const state = context.store.getState();

	const siteId = getSelectedSiteId( state );
	const selectedSite = getSite( state, siteId );
	const eligibleForProPlan = isEligibleForProPlan( state, siteId );

	if ( ! selectedSite ) {
		page.redirect( '/plans/' );

		return null;
	}

	if (
		isFreePlanProduct( selectedSite.plan ) ||
		( eligibleForProPlan && isFlexiblePlanProduct( selectedSite.plan ) )
	) {
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
