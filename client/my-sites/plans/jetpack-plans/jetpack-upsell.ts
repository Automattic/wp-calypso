import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { jetpackProductUpsell } from './controller';

export const jetpackUpsell = ( rootUrl: string, ...rest: PageJS.Callback[] ) => {
	page(
		`${ rootUrl }/upsell/:product/:site?`,
		...rest,
		jetpackProductUpsell( rootUrl ),
		makeLayout,
		clientRender
	);
};
