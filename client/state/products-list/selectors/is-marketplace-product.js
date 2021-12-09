import 'calypso/state/products-list/init';

const productSlugToSubscriptionSlug = ( productSlug ) => productSlug.replace( '-', '_' );

export const isMarketplaceProduct = ( state, productSlug ) =>
	Boolean(
		Object.entries( state.productsList?.items ).find(
			( [ slug, { product_type } ] ) =>
				( slug.startsWith( productSlug ) ||
					slug.startsWith( productSlugToSubscriptionSlug( productSlug ) ) ) &&
				product_type.startsWith( 'marketplace' )
		)
	);
