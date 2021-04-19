/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';

export default async function ( rootUrl: string, ...rest: PageJS.Callback[] ): Promise< void > {
	const { productSelect } = await import( './controller' );
	page(
		`${ rootUrl }/:duration?/:site?`,
		...rest,
		productSelect( rootUrl ),
		makeLayout,
		clientRender
	);
}
