import { translate } from 'i18n-calypso';
import { FieldTypes } from '../types';

const validateNonEmpty = ( message?: string ) => ( field?: FieldTypes ) => {
	if ( ! field?.length ) {
		return message ?? translate( 'Field should not be empty' );
	}
	return null;
};

export default validateNonEmpty;
