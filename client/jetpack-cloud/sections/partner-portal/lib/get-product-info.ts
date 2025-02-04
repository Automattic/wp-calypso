import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';

/**
 * Get SelectorProduct from productSlug
 * @param slug Product slug
 * @returns SelectorProduct | null
 */
export default function getProductInfo( slug: string ) {
	/*
	 * To reuse existing product info, we need to convert the product slug to the format used in the product store.
	 * We are also using only the monthly slug to ensure we hit the equivalent product in the product store.
	 */
	const baseSlug = slug.replaceAll( /-/g, '_' ).replace( /_(monthly|yearly)$/, '' );
	return (
		slugToSelectorProduct( baseSlug + '_monthly' ) || slugToSelectorProduct( baseSlug + '_yearly' )
	);
}
