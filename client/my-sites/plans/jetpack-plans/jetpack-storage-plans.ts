import page, { type Callback } from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { jetpackStoragePricing } from './controller';

export const jetpackStoragePlans = ( rootUrl: string, ...rest: Callback[] ) => {
	page( `${ rootUrl }/storage/:site`, ...rest, jetpackStoragePricing, makeLayout, clientRender );
};
