import 'calypso/state/products-list/init';

const productSlugToSubscriptionSlug = ( productSlug ) => productSlug.replace( '-', '_' );

export function isMarketplaceProduct( state, productSlug ) {
	const product =
		state.productsList?.items?.[ productSlug ] ||
		state.productsList?.items?.[ productSlugToSubscriptionSlug( productSlug ) ];
	return Boolean( product ) && product.product_type.startsWith( 'marketplace' );
}
