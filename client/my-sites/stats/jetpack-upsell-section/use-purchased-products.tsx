import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SECURITY_PLANS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import {
	default as getSiteProducts,
	SiteProduct,
} from 'calypso/state/sites/selectors/get-site-products';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

//
// WARNING: This hook will only work within Odyssey Stats!
// It also requires the existence of ${api_root}/jetpack/v4/site/purchases!
//
// TODO: check whether the site plan supports these products.
const KEY_SLUG_MAP = new Map( [
	[ 'backup', [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SECURITY_PLANS ] as readonly string[] ],
	[ 'boost', JETPACK_BOOST_PRODUCTS as readonly string[] ],
	[ 'search', JETPACK_SEARCH_PRODUCTS as readonly string[] ],
	[ 'security', JETPACK_SECURITY_PLANS as readonly string[] ],
	[ 'social', JETPACK_SOCIAL_PRODUCTS as readonly string[] ],
	[ 'video', JETPACK_VIDEOPRESS_PRODUCTS as readonly string[] ],
] );

function getSupportedProductSlugs( siteProducts?: SiteProduct[] | null ) {
	const products = [] as string[];
	// Find active purchase product slugs.
	const purchasedProductSlugs =
		siteProducts?.filter( ( p ) => ! p.expired )?.map( ( p ) => p.productSlug ) ?? [];
	// Append active product slugs to the products array.
	KEY_SLUG_MAP.forEach( ( value, key ) => {
		if ( purchasedProductSlugs.some( ( slug ) => value.includes( slug ) ) ) {
			products.push( key );
		}
	} );
	return products;
}

export default function usePurchasedProducts() {
	const purchasedProducts = useSelector( ( state ) =>
		getSiteProducts( state, getSelectedSiteId( state ) )
	);

	return {
		purchasedProducts: getSupportedProductSlugs( purchasedProducts ),
	};
}
