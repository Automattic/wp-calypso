import { isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CurrentPlan from './';

export function currentPlan( context, next ) {
	const state = context.store.getState();

	const selectedSite = getSelectedSite( state );

	if ( ! selectedSite ) {
		page.redirect( '/plans/' );

		return null;
	}

	if ( isFreePlanProduct( selectedSite.plan ) ) {
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
