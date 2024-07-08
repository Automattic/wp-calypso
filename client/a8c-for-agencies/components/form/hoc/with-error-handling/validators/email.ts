import emailValidator from 'email-validator';
import { translate } from 'i18n-calypso';
import { FieldTypes } from '..';

const validateEmail = ( field?: FieldTypes ) => {
	if ( ! field || ! field?.length ) {
		return null;
	}

	if ( typeof field !== 'string' || ! emailValidator.validate( field ) ) {
		return translate( 'Please provide correct email' );
	}
	return null;
};

export default validateEmail;
