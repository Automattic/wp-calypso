/** @format */

/**
 * External dependencies
 */
import page from 'page';

export function redirectRoot( context ) {
	let redirectPath = '/read';
	if ( context.querystring ) {
		redirectPath += `?${ context.querystring }`;
	}
	page.redirect( redirectPath );
}
