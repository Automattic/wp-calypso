import {
	ADD_ON_50GB_STORAGE,
	ADD_ON_100GB_STORAGE,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';
import type { AddOnList } from './types';

export const ADD_ONS_LIST: AddOnList = {
	[ ADD_ON_50GB_STORAGE ]: {
		getSlug: () => ADD_ON_50GB_STORAGE,
		getUnitProductSlug: () => PRODUCT_1GB_SPACE,
		getQuantity: () => 50,
		getTitle: () => i18n.translate( '50 GB' ),
		getCompareTitle: () => i18n.translate( '50 GB' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},
	[ ADD_ON_100GB_STORAGE ]: {
		getSlug: () => ADD_ON_100GB_STORAGE,
		getUnitProductSlug: () => PRODUCT_1GB_SPACE,
		getQuantity: () => 100,
		getTitle: () => i18n.translate( '100 GB' ),
		getCompareTitle: () => i18n.translate( '100 GB' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},
};

export const getPlanAddOnsObject = ( planFeaturesList?: Array< string > ) => {
	if ( ! planFeaturesList ) {
		return [];
	}
	return planFeaturesList.map( ( featuresConst ) => ADD_ONS_LIST[ featuresConst ] );
};

export function isValidAddOnKey( feature: string ) {
	return !! ADD_ONS_LIST[ feature ];
}

export function getAddOnByKey( feature: string ) {
	return ADD_ONS_LIST[ feature ];
}
