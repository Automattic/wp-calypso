import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { jetpackFreeWelcome, productSelect } from './controller';

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
