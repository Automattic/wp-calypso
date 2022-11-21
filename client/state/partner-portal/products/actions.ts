import { AnyAction } from 'redux';
import {
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_ADD,
	JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_REMOVE,
} from 'calypso/state/action-types';

export function addSelectedProductSlugs( productSlugs: string | string[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_ADD, productSlugs };
}

export function removeSelectedProductSlugs( productSlugs: string | string[] ): AnyAction {
	return { type: JETPACK_PARTNER_PORTAL_SELECTED_PRODUCT_SLUGS_REMOVE, productSlugs };
}
