let DEFAULT_GLOBAL_STYLES_VARIATION_SLUG = '';
let isDefaultGlobalStylesVariationSlug = () => false;

if ( typeof window !== 'undefined' ) {
	import( '@automattic/global-styles' )
		.then( ( module ) => {
			DEFAULT_GLOBAL_STYLES_VARIATION_SLUG = module.DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;
			isDefaultGlobalStylesVariationSlug = module.isDefaultGlobalStylesVariationSlug;
		} )
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		.catch( () => {} );
}

export const asyncGetDefaultGlobalStylesVariationSlug = () => DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;
export const asyncIsDefaultGlobalStylesVariationSlug = isDefaultGlobalStylesVariationSlug;
