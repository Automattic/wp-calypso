/** @format */
/**
 * Internal dependencies
 */
var masking = require( './masking' ),
	validation = require( './validation' );

module.exports = {
	getCreditCardType: validation.getCreditCardType,
	maskField: masking.maskField,
	unmaskField: masking.unmaskField,
	validateCardDetails: validation.validateCardDetails,
};
