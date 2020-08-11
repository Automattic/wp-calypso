/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { siteSelection } from 'my-sites/controller';
import { productSelect, productDetails, productUpsell } from './controller';

const trackedPage = ( url: string, ...rest: PageJS.Callback[] ) => {
	page( url, siteSelection, ...rest, makeLayout, clientRender );
};

export default function ( rootUrl: string, ...rest: PageJS.Callback[] ) {
	trackedPage( `${ rootUrl }/:duration?`, productSelect( rootUrl ), ...rest );
	trackedPage( `${ rootUrl }/:product/details`, productDetails( rootUrl ), ...rest );
	trackedPage( `${ rootUrl }/:product/:duration/details`, productDetails( rootUrl ), ...rest );
	trackedPage( `${ rootUrl }/:product/:duration/additions`, productUpsell( rootUrl ), ...rest );
}
