import page from 'page';
import { loggedInSiteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackStoragePlans } from 'calypso/my-sites/plans/jetpack-plans/jetpack-storage-plans';
import { jetpackPricingContext } from './controller';
import './style.scss';

export default function (): void {
	// Redirects
	page( '/:locale/plans/storage/:site', ( { params } ) =>
		page.redirect( `/${ params.locale }/pricing/storage/${ params.site }` )
	);
	page( '/plans/storage/:site', ( { params } ) =>
		page.redirect( `/pricing/storage/${ params.site }` )
	);
	page( '/:locale/plans', ( { params } ) => page.redirect( `/${ params.locale }/pricing` ) );
	page( '/plans/:site', ( { params } ) => page.redirect( `/pricing/${ params.site }` ) );
	page( '/plans', '/pricing' );

	jetpackStoragePlans( '/:locale/pricing', loggedInSiteSelection, jetpackPricingContext );
	jetpackStoragePlans( '/pricing', loggedInSiteSelection, jetpackPricingContext );
	jetpackPlans( '/:locale/pricing', jetpackPricingContext );
	jetpackPlans( '/pricing', loggedInSiteSelection, jetpackPricingContext );
}
