import { translate } from 'i18n-calypso';
import { isValidUrl } from '../../../utils';
import { FieldTypes } from '../types';

const validateUrl = ( message?: string ) => ( field?: FieldTypes ) => {
	if ( ! field || ! field?.length ) {
		return null;
	}

	if ( typeof field !== 'string' || ! isValidUrl( field ) ) {
		return message ?? translate( 'Please provide correct URL' );
	}
	return null;
};

export default validateUrl;
