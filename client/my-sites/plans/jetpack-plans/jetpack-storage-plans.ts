import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	doForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import { jetpackStoragePricing } from './controller';

export const jetpackStoragePlans = ( rootUrl: string, ...rest: PageJS.Callback[] ) => {
	doForCurrentCROIteration( ( key ) => {
		if ( Iterations.ONLY_REALTIME_PRODUCTS === key ) {
			page(
				`${ rootUrl }/storage/:site`,
				...rest,
				jetpackStoragePricing,
				makeLayout,
				clientRender
			);
		}
	} );
};
