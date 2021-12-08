import 'calypso/state/products-list/init';

export function isMarketplaceProduct( state, productSlug ) {
	const product = state.productsList?.items?.[ productSlug ];
	return Boolean( product ) && product.product_type.startsWith( 'marketplace' );
}
