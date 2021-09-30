import page from 'page';
import { loggedInSiteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackPricingContext } from './controller';
import './style.scss';

export default function (): void {
	// Redirects
	page( '/:locale/plans', ( { params } ) => page.redirect( `/${ params.locale }/pricing` ) );
	page( '/plans/:site', ( { params } ) => page.redirect( `/pricing/${ params.site }` ) );
	page( '/plans', '/pricing' );

	jetpackPlans( '/:locale/pricing', jetpackPricingContext );
	jetpackPlans( '/pricing', loggedInSiteSelection, jetpackPricingContext );
}
