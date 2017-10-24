/**
 * Internal dependencies
 *
 * @format
 */

import masking from './masking';
import validation from './validation';

export const getCreditCardType = validation.getCreditCardType;
export const maskField = masking.maskField;
export const unmaskField = masking.unmaskField;
export const validateCardDetails = validation.validateCardDetails;
export default {
	getCreditCardType,
	maskField,
	unmaskField,
	validateCardDetails,
};
