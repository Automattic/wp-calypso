import {
	PRODUCT_1GB_SPACE,
	PRODUCT_100GB_STORAGE,
	PRODUCT_200GB_STORAGE,
} from '@automattic/calypso-products';
import i18n, { TranslateResult } from 'i18n-calypso';

export type FeatureObject = {
	getSlug: () => string;
	getTitle: ( domainName?: string ) => TranslateResult;
	getDescription?: ( domainName?: string ) => TranslateResult;
	getQuantity?: () => number;
};
export type AddOnsList = {
	[ key: string ]: FeatureObject;
};

export const ADD_ONS_LIST: AddOnsList = {
	[ PRODUCT_100GB_STORAGE ]: {
		getSlug: () => PRODUCT_1GB_SPACE,
		getQuantity: () => 100,
		getTitle: () => i18n.translate( '100 GB storage space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},
	[ PRODUCT_200GB_STORAGE ]: {
		getSlug: () => PRODUCT_1GB_SPACE,
		getQuantity: () => 200,
		getTitle: () => i18n.translate( '200 GB storage space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},
};

export const getPlanAddOnsObject = ( planAddonsList?: Array< string > ) => {
	if ( ! planAddonsList ) {
		return [];
	}
	return planAddonsList.map( ( featuresConst ) => ADD_ONS_LIST[ featuresConst ] );
};

export function isValidAddOnKey( feature: string ) {
	return !! ADD_ONS_LIST[ feature ];
}

export function getAddOnByKey( feature: string ) {
	return ADD_ONS_LIST[ feature ];
}
