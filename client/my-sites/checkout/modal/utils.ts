import { navigate } from 'calypso/lib/navigate';
import { addQueryArgs } from 'calypso/lib/url';
import { KEY_PRODUCTS } from './constants';

export const openCheckoutModal = (
	products: string[],
	searchParams: Record< string, string > = {}
) => {
	const relativeCurrentPath = window.location.href.replace( window.location.origin, '' );
	const path = addQueryArgs(
		{
			...searchParams,
			[ KEY_PRODUCTS ]: products.join( ',' ),
			cancel_to: searchParams.cancel_to || relativeCurrentPath,
		},
		relativeCurrentPath
	);

	navigate( path );
};
