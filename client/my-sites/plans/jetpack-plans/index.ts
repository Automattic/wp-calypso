import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { storageUpgradeSiteSelection } from 'calypso/jetpack-cloud/controller';
import { jetpackPricingContext } from 'calypso/jetpack-cloud/sections/pricing/controller';
import {
	doForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import { jetpackStoragePricing, jetpackFreeWelcome, productSelect } from './controller';

export default function ( rootUrl: string, ...rest: PageJS.Callback[] ): void {
	page( `${ rootUrl }/jetpack-free/welcome`, jetpackFreeWelcome, makeLayout, clientRender );

	doForCurrentCROIteration( ( key ) => {
		if ( Iterations.ONLY_REALTIME_PRODUCTS === key ) {
			page(
				`${ rootUrl }/storage/:site`,
				storageUpgradeSiteSelection,
				jetpackPricingContext,
				jetpackStoragePricing,
				makeLayout,
				clientRender
			);
		}
	} );

	page(
		`${ rootUrl }/:duration?/:site?`,
		...rest,
		productSelect( rootUrl ),
		makeLayout,
		clientRender
	);
}
