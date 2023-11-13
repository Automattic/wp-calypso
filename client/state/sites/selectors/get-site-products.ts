import getRawSite from 'calypso/state/selectors/get-raw-site';
import { IAppState } from 'calypso/state/types';

export interface SiteProduct {
	productId: number;
	productSlug: string;
	productName: string;
	productNameShort: string | null;
	expired: boolean;
	userIsOwner: boolean;
}

export interface RawSiteProduct {
	product_id: string;
	product_slug: string;
	product_name: string;
	product_name_short: string | null;
	expired: boolean;
	user_is_owner: boolean;
}

interface SiteWithProducts {
	products: RawSiteProduct[];
}

function isSiteWithProducts( site: unknown ): site is SiteWithProducts {
	return ( site as SiteWithProducts )?.products !== undefined;
}

/**
 * Gets a site's products from the state.
 * @param state Redux state.
 * @param siteId The site ID.
 */
export default function getSiteProducts(
	state: IAppState,
	siteId: number | null
): null | SiteProduct[] {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId );

	if ( ! site || ! isSiteWithProducts( site ) ) {
		return null;
	}

	return site.products.map( ( product ) => ( {
		productId: parseInt( String( product.product_id ), 10 ),
		productSlug: product.product_slug,
		productName: product.product_name,
		productNameShort: product.product_name_short || null,
		expired: !! product.expired,
		userIsOwner: !! product.user_is_owner,
	} ) );
}
