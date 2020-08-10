/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import useCountryList from 'my-sites/checkout/composite-checkout/wpcom/hooks/use-country-list';
import { shouldRenderAdditionalCountryFields } from 'lib/checkout/processor-specific';
import CountrySpecificPaymentFields from 'my-sites/checkout/checkout/country-specific-payment-fields';

export default function ContactFields( {
	getFieldValue,
	setFieldValue,
	getErrorMessagesForField,
} ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';
	const countriesList = useCountryList( [] );

	return (
		<div className="contact-fields">
			{ shouldRenderAdditionalCountryFields( getFieldValue( 'countryCode' ) ) && (
				<CountrySpecificPaymentFieldsUI
					countryCode={ getFieldValue( 'countryCode' ) }
					countriesList={ countriesList }
					getErrorMessage={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ setFieldValue }
					disableFields={ isDisabled }
				/>
			) }
		</div>
	);
}

const CountrySpecificPaymentFieldsUI = styled( CountrySpecificPaymentFields )`
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
