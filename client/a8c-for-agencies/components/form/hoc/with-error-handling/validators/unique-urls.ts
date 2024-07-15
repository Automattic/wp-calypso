import { translate } from 'i18n-calypso';
import { areURLsUnique, isValidUrl } from '../../../utils';
import { FieldTypes } from '../types';

const validateUniqueUrls = ( messages?: string[] ) => ( field?: FieldTypes ) => {
	if ( ! field?.length || ! Array.isArray( field ) ) {
		return messages?.[ 0 ] ?? translate( `URLs can't be empty` );
	}
	for ( const url of field ) {
		if ( typeof url !== 'string' || ! isValidUrl( url ) ) {
			return messages?.[ 1 ] ?? translate( `Please provide valid URLs` );
		}
	}
	if ( ! areURLsUnique( field ) ) {
		return messages?.[ 2 ] ?? translate( `URLs should be unique` );
	}

	return null;
};

export default validateUniqueUrls;
