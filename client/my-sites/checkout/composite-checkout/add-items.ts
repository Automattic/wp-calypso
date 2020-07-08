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
import type { RequestCartProduct } from './wpcom/types';

const debug = debugFactory( 'calypso:composite-checkout:add-items' );

export function createItemToAddToCart( {
	planSlug,
	productAlias,
	product_id,
	isJetpackNotAtomic,
}: {
	planSlug: string | undefined;
	productAlias: string | undefined;
	product_id: number;
	isJetpackNotAtomic: boolean | undefined;
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

	if (
		( productAlias?.startsWith( 'jetpack_backup' ) ||
			productAlias?.startsWith( 'jetpack_search' ) ) &&
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
