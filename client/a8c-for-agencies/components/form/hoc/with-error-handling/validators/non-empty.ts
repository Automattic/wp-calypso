import { translate } from 'i18n-calypso';
import { FieldTypes } from '..';

const validateNonEmpty = ( field?: FieldTypes ) => {
	if ( ! field?.length ) {
		return translate( 'Field should not be empty' );
	}
	return null;
};

export default validateNonEmpty;
