/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller/index.web';
import { productSelect, productDetails, productUpsell } from './controller';

const trackedPage = ( url: string, ...rest: PageJS.Callback[] ) => {
	page( url, ...rest, makeLayout, clientRender );
};

export default function ( rootUrl: string, ...rest: PageJS.Callback[] ) {
	trackedPage( `${ rootUrl }/:duration?`, ...rest, productSelect( rootUrl ) );
	trackedPage( `${ rootUrl }/:product/:duration/details`, ...rest, productDetails( rootUrl ) );
	trackedPage( `${ rootUrl }/:product/:duration/additions`, ...rest, productUpsell( rootUrl ) );
}
