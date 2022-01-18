import page from 'page';
import { addQueryArgs } from 'calypso/lib/url';

export const openCheckoutModal = ( products: string[] ) => {
	page(
		addQueryArgs(
			{ products: products.join( ',' ) },
			window.location.href.replace( window.location.origin, '' )
		)
	);
};
