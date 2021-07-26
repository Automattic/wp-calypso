/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { productSelect, jetpackFreeWelcome } from './controller';

export default function ( rootUrl: string, ...rest: PageJS.Callback[] ): void {
	page( `${ rootUrl }/jetpack-free/welcome`, jetpackFreeWelcome, makeLayout, clientRender );

	page(
		`${ rootUrl }/:duration?/:site?`,
		...rest,
		productSelect( rootUrl ),
		makeLayout,
		clientRender
	);
}
