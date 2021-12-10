import 'calypso/state/products-list/init';

const cleanSlug = ( slug ) => slug.replace( /_/g, '-' ).split( /-(monthly|yearly|2y)/ )[ 0 ];

export const isMarketplaceProduct = ( state, productSlug ) =>
	Object.entries( state.productsList?.items ).some(
		( [ subscriptionSlug, { product_type } ] ) =>
			cleanSlug( productSlug ) === cleanSlug( subscriptionSlug ) &&
			product_type.startsWith( 'marketplace' )
	);
