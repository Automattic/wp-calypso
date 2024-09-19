import emailValidator from 'email-validator';
import { translate } from 'i18n-calypso';

export const validateName = ( name: string ) => {
	if ( ! name ) {
		return translate( 'Name is required' );
	}
	return null;
};

export const validateEmail = ( email: string, fullValidation = false ) => {
	if ( ! email ) {
		return translate( 'Email is required' );
	}
	if ( fullValidation && ! emailValidator.validate( email ) ) {
		return translate( 'Please enter a valid email address' );
	}
	return null;
};

export const validateTerms = ( terms: boolean ) => {
	if ( ! terms ) {
		return translate( 'Terms must be accepted' );
	}
	return null;
};

export function validateForm( formData: FormData ) {
	let errors = {};
	let hasErrors = false;

	let error = validateName( formData.get( 'name' ) as string );
	if ( error ) {
		errors = { ...errors, name: error };
		hasErrors = true;
	}
	error = validateEmail( formData.get( 'email' ) as string, true );
	if ( error ) {
		errors = { ...errors, email: error };
		hasErrors = true;
	}
	error = validateTerms( Boolean( formData.get( 'termsAccepted' ) ) );
	if ( error ) {
		errors = { ...errors, termsAccepted: error };
		hasErrors = true;
	}
	return hasErrors ? errors : null;
}
