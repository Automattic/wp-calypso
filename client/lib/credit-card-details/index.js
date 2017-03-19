/**
 * Internal dependencies
 */
var masking = require( './masking' ),
	validation = require( './validation');

export default {
	getCreditCardType: validation.getCreditCardType,
	maskField: masking.maskField,
	unmaskField: masking.unmaskField,
	validateCardDetails: validation.validateCardDetails
};
