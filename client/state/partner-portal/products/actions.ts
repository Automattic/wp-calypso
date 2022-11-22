import { AnyAction } from 'redux';
import {
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_ADD,
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_REMOVE,
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_CLEAR,
} from 'calypso/state/action-types';
// Required for modular state.
import 'calypso/state/partner-portal/init';

export function addSelectedProductSlugs( productSlugs: string | string[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_ADD, productSlugs };
}

export function removeSelectedProductSlugs( productSlugs: string | string[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_REMOVE, productSlugs };
}

export function clearSelectedProductSlugs(): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_CLEAR };
}
