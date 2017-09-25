/**
 * Internal dependencies
 */
import masking from './masking';
import validation from './validation';

export default {
	getCreditCardType: validation.getCreditCardType,
	maskField: masking.maskField,
	unmaskField: masking.unmaskField,
	validateCardDetails: validation.validateCardDetails
};
