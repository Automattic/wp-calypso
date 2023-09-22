import { PartnerPortalStore, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
// Required for modular state.
import 'calypso/state/partner-portal/init';

export function getSelectedProductSlugs( state: PartnerPortalStore ) {
	return state.partnerPortal.products.selectedProductSlugs;
}

export function getDisabledProductSlugs(
	state: PartnerPortalStore,
	allProducts: APIProductFamilyProduct[]
) {
	const selectedProductSlugs = getSelectedProductSlugs( state );

	return (
		selectedProductSlugs
			// Get the product objects corresponding to the selected product slugs
			.map(
				( selectedProductSlug ) =>
					allProducts?.find( ( product ) => product.slug === selectedProductSlug )
			)
			// Get all the product slugs of products within the same product family as the selected product
			.flatMap(
				( selectedProduct ) =>
					allProducts
						?.filter(
							( product ) =>
								product.family_slug === selectedProduct?.family_slug &&
								product.slug !== selectedProduct.slug
						)
						.map( ( product ) => product.slug )
			)
	);
}

export function getTotalSelectedCost(
	state: PartnerPortalStore,
	allProducts: APIProductFamilyProduct[]
) {
	const selectedProductSlugs = getSelectedProductSlugs( state );

	const totalSelectedProductCost = allProducts
		.filter( ( product ) => selectedProductSlugs.includes( product.slug ) )
		.map( ( product ) => product.amount )
		.reduce( ( totalCost, productCost ) => totalCost + productCost, 0 );

	return totalSelectedProductCost;
}
