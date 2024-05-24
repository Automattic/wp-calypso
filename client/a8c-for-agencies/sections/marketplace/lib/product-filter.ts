import {
	isWooCommerceProduct,
	isWpcomHostingProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import {
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
	PRODUCT_TYPE_ADDON,
	PRODUCT_TYPE_EXTENSION,
	PRODUCT_TYPE_JETPACK_BACKUP_ADDON,
	PRODUCT_TYPE_JETPACK_PLAN,
	PRODUCT_TYPE_JETPACK_PRODUCT,
	PRODUCT_TYPE_PLAN,
	PRODUCT_TYPE_PRESSABLE_PLAN,
	PRODUCT_TYPE_PRODUCT,
	PRODUCT_TYPE_WOO_EXTENSION,
	PRODUCT_TYPE_WPCOM_PLAN,
} from '../constants';
import { isPressableHostingProduct, isWPCOMHostingProduct } from '../lib/hosting';

export type SelectedFilters = {
	[ PRODUCT_FILTER_KEY_CATEGORIES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_TYPES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_PRICES ]: Record< string, boolean >;
};

export function hasSelectedFilter( selectedFilters: SelectedFilters ) {
	return Object.values( selectedFilters ).some( ( filter ) => {
		return Object.values( filter ).some( ( selected ) => selected );
	} );
}

export function filterProductsAndPlans(
	selectedFilters: SelectedFilters,
	productsAndPlans: APIProductFamilyProduct[]
) {
	return productsAndPlans;
}

export function filterProductsAndPlansByType(
	filter: string | null,
	allProductsAndPlans?: APIProductFamilyProduct[]
) {
	switch ( filter ) {
		case PRODUCT_TYPE_JETPACK_PRODUCT:
		case PRODUCT_TYPE_PRODUCT: // Right now this is the same as jetpack product but once we have more non-jetpack products we can separate them.
			return (
				allProductsAndPlans?.filter(
					( { family_slug } ) =>
						family_slug !== 'jetpack-packs' &&
						family_slug !== 'jetpack-backup-storage' &&
						! isWooCommerceProduct( family_slug ) &&
						! isWpcomHostingProduct( family_slug ) &&
						! isPressableHostingProduct( family_slug )
				) || []
			);
		case PRODUCT_TYPE_JETPACK_PLAN:
		case PRODUCT_TYPE_PLAN: // Right now this is the same as jetpack plan but once we have more non-jetpack plans we can separate them.
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => family_slug === 'jetpack-packs' ) || []
			);

		case PRODUCT_TYPE_JETPACK_BACKUP_ADDON:
		case PRODUCT_TYPE_ADDON: // Right now this is the same as jetpack backup addons but once we have more non-jetpack addons we can separate them.
			return (
				allProductsAndPlans
					?.filter( ( { family_slug } ) => family_slug === 'jetpack-backup-storage' )
					.sort( ( a, b ) => a.product_id - b.product_id ) || []
			);

		case PRODUCT_TYPE_WOO_EXTENSION:
		case PRODUCT_TYPE_EXTENSION:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => isWooCommerceProduct( family_slug ) ) ||
				[]
			);
		case PRODUCT_TYPE_PRESSABLE_PLAN:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) =>
					isPressableHostingProduct( family_slug )
				) || []
			);
		case PRODUCT_TYPE_WPCOM_PLAN:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) =>
					isWPCOMHostingProduct( family_slug )
				) || []
			);
	}

	return allProductsAndPlans || [];
}
