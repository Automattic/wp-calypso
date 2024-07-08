import { translate } from 'i18n-calypso';
import { isValidUrl } from 'calypso/a8c-for-agencies/sections/partner-directory/utils/tools';
import { FieldTypes } from '..';

const validateUrl = ( field?: FieldTypes ) => {
	if ( ! field || ! field?.length ) {
		return null;
	}

	if ( typeof field !== 'string' || ! isValidUrl( field ) ) {
		return translate( 'Please provide correct URL' );
	}
	return null;
};

export default validateUrl;
