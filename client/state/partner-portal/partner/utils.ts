import { sprintf, __ } from '@wordpress/i18n';

/**
 * Translate a REST API rest_invalid_param error message.
 *
 * @param {object} parameters Parameters with errors.
 * @returns {string} Human-readable error message.
 */
export function translateInvalidPartnerParameterError( parameters: object ) {
	const labels: { [ key: string ]: string } = {
		name: __( 'Company name' ),
		contact_person: __( 'Contact person' ),
		company_website: __( 'Company website' ),
		city: __( 'City' ),
		country: __( 'Country' ),
		line1: __( 'Address line 1' ),
		line2: __( 'Address line 2' ),
		postal_code: __( 'Postal code' ),
		state: __( 'State' ),
	};

	const fieldNames = Object.keys( parameters ).map( ( field ) => {
		return labels[ field ] || field;
	} );

	// Translators: %s = comma-separated list of form fields that need to be filled in by the user.
	return sprintf( __( 'The following fields are required: %s' ), fieldNames.join( ', ' ) );
}
