/**
 * External dependencies
 */
import { FunctionComponent } from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import CountrySpecificPaymentFieldsUnstyled from 'calypso/my-sites/checkout/checkout/country-specific-payment-fields';

export type CountrySpecificPaymentFieldsProps = {
	countryCode: string;
	countriesList: { key: string; label: string; code: string; disabled: boolean }[];
	getErrorMessage: ( arg0: string ) => string[];
	getFieldValue: ( arg0: string ) => string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
	disableFields: boolean;
};

const CountrySpecificPaymentFields: FunctionComponent< CountrySpecificPaymentFieldsProps > = styled(
	CountrySpecificPaymentFieldsUnstyled
)`
	margin-top: 0;

	& .checkout__form-info-text {
		display: none;
	}

	& .document,
	& .phone,
	& .postal-code,
	& .checkout__form-state-field {
		flex-basis: auto;
	}

	& .checkout__checkout-field,
	& .checkout__form-state-field {
		margin-left: 0;
	}

	& .checkout__form-info-text,
	& .form__hidden-input a {
		margin-left: 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
		& .address-1,
		& .state {
			margin-right: 15px;
		}
	}
`;

export default CountrySpecificPaymentFields;
