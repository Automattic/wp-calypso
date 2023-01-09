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
			return translate( '1 GB' );
		case FEATURE_6GB_STORAGE:
			return translate( '6 GB' );
		case FEATURE_13GB_STORAGE:
			return translate( '13 GB' );
		case FEATURE_200GB_STORAGE:
			return translate( '200 GB' );
		default:
			return null;
	}
};
