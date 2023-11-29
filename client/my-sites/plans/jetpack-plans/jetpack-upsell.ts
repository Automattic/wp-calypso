import page, { type Callback } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { jetpackProductUpsell } from './controller';

export const jetpackUpsell = ( rootUrl: string, ...rest: Callback[] ) => {
	page(
		`${ rootUrl }/upsell/:product/:site?`,
		...rest,
		jetpackProductUpsell( rootUrl ),
		makeLayout,
		clientRender
	);
};
