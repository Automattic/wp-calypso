import page from 'page';
import { addQueryArgs } from 'calypso/lib/url';
import { KEY_PRODUCTS } from './constants';

export const openCheckoutModal = ( products: string[] ) => {
	page(
		addQueryArgs(
			{ [ KEY_PRODUCTS ]: products.join( ',' ) },
			window.location.href.replace( window.location.origin, '' )
		)
	);
};
