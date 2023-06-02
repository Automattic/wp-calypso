import page from 'page';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { loggedInSiteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackStoragePlans } from 'calypso/my-sites/plans/jetpack-plans/jetpack-storage-plans';
import { jetpackUpsell } from 'calypso/my-sites/plans/jetpack-plans/jetpack-upsell';
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
	page( '/:locale/plans/upsell/:product/:site?', ( { params } ) =>
		page.redirect( `/${ params.locale }/pricing/upsell/${ params.product }/${ params.site || '' }` )
	);
	page( '/plans/upsell/:product/:site?', ( { params } ) =>
		page.redirect( `/pricing/upsell/${ params.product }/${ params.site || '' }` )
	);
	page( '/:locale/plans', ( { params } ) => page.redirect( `/${ params.locale }/pricing` ) );
	page( '/plans/:site', ( { params } ) => page.redirect( `/pricing/${ params.site }` ) );
	page( '/plans', '/pricing' );

	jetpackStoragePlans(
		`/:lang/pricing`,
		setLocaleMiddleware(),
		loggedInSiteSelection,
		jetpackPricingContext
	);
	jetpackStoragePlans( '/pricing', loggedInSiteSelection, jetpackPricingContext );
	jetpackUpsell(
		`/:lang/pricing`,
		setLocaleMiddleware(),
		loggedInSiteSelection,
		jetpackPricingContext
	);
	jetpackUpsell( '/pricing', loggedInSiteSelection, jetpackPricingContext );
	jetpackPlans( `/:lang/pricing`, setLocaleMiddleware(), jetpackPricingContext );
	jetpackPlans( '/pricing', loggedInSiteSelection, jetpackPricingContext );
}
