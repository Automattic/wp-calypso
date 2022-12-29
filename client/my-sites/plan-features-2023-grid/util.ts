import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

export const getStorageStringFromFeature = ( storageFeature: string ) => {
	switch ( storageFeature ) {
		case FEATURE_1GB_STORAGE:
			return translate( '1GB' );
		case FEATURE_6GB_STORAGE:
			return translate( '6GB' );
		case FEATURE_13GB_STORAGE:
			return translate( '13GB' );
		case FEATURE_200GB_STORAGE:
			return translate( '200GB' );
		default:
			return null;
	}
};
