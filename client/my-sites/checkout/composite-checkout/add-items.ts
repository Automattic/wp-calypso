/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	conciergeSessionItem,
	domainMapping,
	planItem,
	themeItem,
	jetpackProductItem,
} from 'lib/cart-values/cart-items';
import { JETPACK_PRODUCTS_LIST, JETPACK_SEARCH_PRODUCTS } from 'lib/products-values/constants';
import type { RequestCartProduct } from './types/backend/shopping-cart-endpoint';
import config from 'config';

const debug = debugFactory( 'calypso:composite-checkout:add-items' );

export function createItemToAddToCart( {
	planSlug,
	productAlias,
	product_id,
	isJetpackNotAtomic,
	isPrivate,
}: {
	product_id: number;
	planSlug?: string;
	productAlias?: string;
	isJetpackNotAtomic?: boolean;
	isPrivate?: boolean;
} ): RequestCartProduct | null {
	let cartItem, cartMeta;

	if ( planSlug && product_id ) {
		debug( 'creating plan product' );
		cartItem = planItem( planSlug );
		if ( cartItem ) {
			cartItem.product_id = product_id;
		}
	}

	if ( productAlias?.startsWith( 'theme:' ) && product_id ) {
		debug( 'creating theme product' );
		cartMeta = productAlias.split( ':' )[ 1 ];
		cartItem = themeItem( cartMeta );
		if ( cartItem ) {
			cartItem.product_id = product_id;
		}
	}

	if ( productAlias?.startsWith( 'domain-mapping:' ) && product_id ) {
		debug( 'creating domain mapping product' );
		cartMeta = productAlias.split( ':' )[ 1 ];
		cartItem = domainMapping( { domain: cartMeta } );
		if ( cartItem ) {
			cartItem.product_id = product_id;
		}
	}

	if ( productAlias === 'concierge-session' && product_id ) {
		debug( 'creating concierge product' );
		cartItem = conciergeSessionItem();
		if ( cartItem ) {
			cartItem.product_id = product_id;
		}
	}

	// Search product
	if ( productAlias && JETPACK_SEARCH_PRODUCTS.includes( productAlias ) && product_id ) {
		cartItem = null;
		let isSearchProduct = false;
		// is site JP
		if ( isJetpackNotAtomic ) {
			debug( 'creating jetpack search product' );
			isSearchProduct = true;
		}
		// is site WPCOM
		else if (
			config.isEnabled( 'jetpack/wpcom-search-product' ) &&
			! isJetpackNotAtomic &&
			! isPrivate
		) {
			debug( 'creating wpcom search product' );
			isSearchProduct = true;
		}
		if ( isSearchProduct ) {
			cartItem = jetpackProductItem( productAlias );
			if ( cartItem ) {
				cartItem.product_id = product_id;
			}
		}
	}

	if (
		productAlias &&
		JETPACK_PRODUCTS_LIST.includes( productAlias ) &&
		isJetpackNotAtomic &&
		product_id
	) {
		debug( 'creating jetpack product' );
		cartItem = jetpackProductItem( productAlias );
		if ( cartItem ) {
			cartItem.product_id = product_id;
		}
	}

	if ( ! cartItem ) {
		debug( 'no product created' );
		return null;
	}

	cartItem.extra = { ...cartItem.extra, context: 'calypstore' };

	const defaultProduct = {
		product_id: 0,
		product_slug: '',
		meta: '',
		extra: {},
	};

	return { ...defaultProduct, ...cartItem };
}
