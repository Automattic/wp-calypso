import i18n, { TranslateResult } from 'i18n-calypso';
import {
	PRODUCT_1GB_SPACE,
	PRODUCT_50GB_STORAGE_ADD_ON,
	PRODUCT_100GB_STORAGE_ADD_ON,
} from './constants';

export type AddOnsObject = {
	getSlug: () => string;
	getTitle: ( domainName?: string ) => TranslateResult;
	getDescription?: ( domainName?: string ) => TranslateResult;
	getQuantity?: () => number;
};
export type AddOnsList = {
	[ key: string ]: AddOnsObject;
};

export const ADD_ONS_LIST: AddOnsList = {
	[ PRODUCT_50GB_STORAGE_ADD_ON ]: {
		getSlug: () => PRODUCT_1GB_SPACE,
		getQuantity: () => 50,
		getTitle: () => i18n.translate( '50 GB storage add on' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},
	[ PRODUCT_100GB_STORAGE_ADD_ON ]: {
		getSlug: () => PRODUCT_1GB_SPACE,
		getQuantity: () => 100,
		getTitle: () => i18n.translate( '100 GB storage add on' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},
};

export const getPlanAddOnsObject = ( planAddonsList?: Array< string > ) => {
	if ( ! planAddonsList ) {
		return [];
	}
	return planAddonsList.map( ( addOnConst ) => ADD_ONS_LIST[ addOnConst ] );
};

export function getAddOnByKey( addOn: string ) {
	return ADD_ONS_LIST[ addOn ];
}
