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
import {
	JETPACK_PRODUCTS_LIST,
	JETPACK_SEARCH_PRODUCTS,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from 'lib/products-values/constants';
import type { RequestCartProduct } from './wpcom/types';
import config from 'config';

const debug = debugFactory( 'calypso:composite-checkout:add-items' );

export function createItemToAddToCart( {
	planSlug,
	productAlias,
	product_id,
	isJetpackNotAtomic,
	isPrivate,
}: {
	planSlug: string | undefined;
	productAlias: string | undefined;
	product_id: number;
	isJetpackNotAtomic: boolean | undefined;
	isPrivate: boolean | undefined;
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
		// is site JP
		if ( isJetpackNotAtomic ) {
			debug( 'creating jetpack search product' );
			cartItem = productAlias.includes( 'monthly' )
				? jetpackProductItem( PRODUCT_JETPACK_SEARCH_MONTHLY )
				: jetpackProductItem( PRODUCT_JETPACK_SEARCH );
		}
		// is site WPCOM
		else if (
			config.isEnabled( 'jetpack/wpcom-search-product' ) &&
			! isJetpackNotAtomic &&
			! isPrivate
		) {
			debug( 'creating wpcom search product' );
			cartItem = productAlias.includes( 'monthly' )
				? jetpackProductItem( PRODUCT_WPCOM_SEARCH_MONTHLY )
				: jetpackProductItem( PRODUCT_WPCOM_SEARCH );
		}

		if ( cartItem ) {
			cartItem.product_id = product_id;
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
