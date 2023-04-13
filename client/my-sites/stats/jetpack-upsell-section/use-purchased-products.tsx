import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SECURITY_PLANS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';
import { useEffect, useState } from 'react';

//
// WARNING: This hook will only work within Odyssey Stats!
// It depends on api_root and nonce from window.configData!
// It also requires the existence of ${api_root}/jetpack/v4/site/purchases!
//

// Include data from stats-admin initialization for making resource requests.
const fetchPurchases = ( resource: string, options = {} ) =>
	// Prefix resource with api_root for the site.
	fetch( window.configData?.api_root + resource, {
		...options,
		credentials: 'include',
		// Attach WordPress nonce to request.
		headers: { 'X-WP-Nonce': window.configData?.nonce },
	} )
		.then( ( res ) => res.json() )
		.then( ( json ) => JSON.parse( json.data ) );

const KEY_SLUG_MAP = new Map( [
	[ 'backup', [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SECURITY_PLANS ] as readonly string[] ],
	[ 'boost', JETPACK_BOOST_PRODUCTS as readonly string[] ],
	[ 'search', JETPACK_SEARCH_PRODUCTS as readonly string[] ],
	[ 'security', JETPACK_SECURITY_PLANS as readonly string[] ],
	[ 'social', JETPACK_SOCIAL_PRODUCTS as readonly string[] ],
	[ 'video', JETPACK_VIDEOPRESS_PRODUCTS as readonly string[] ],
] );

function formatResponse( responseData?: Record< string, string >[] ) {
	const products = [] as string[];
	// Find active purchase product slugs.
	const purchasedProductSlugs =
		responseData?.filter( ( p ) => p.active === '1' )?.map( ( p ) => p.product_slug ) ?? [];
	// Append active product slugs to the products array.
	KEY_SLUG_MAP.forEach( ( value, key ) => {
		if ( purchasedProductSlugs.some( ( slug ) => value.includes( slug ) ) ) {
			products.push( key );
		}
	} );
	return products;
}

export default function usePurchasedProducts() {
	const [ purchasedProducts, setPurchasedProducts ] = useState( [] as string[] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState();

	useEffect( () => {
		fetchPurchases( 'jetpack/v4/site/purchases' )
			.then( ( purchases ) => {
				setIsLoading( false );
				setPurchasedProducts( formatResponse( purchases ) );
			} )
			.catch( ( error ) => setError( error ) );
	}, [] );

	return {
		purchasedProducts,
		error,
		isLoading,
	};
}
