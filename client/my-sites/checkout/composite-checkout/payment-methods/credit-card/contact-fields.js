/**
 * External dependencies
 */
import React from 'react';
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
		<div>
			{ shouldRenderAdditionalCountryFields( getFieldValue( 'countryCode' ) ) && (
				<CountrySpecificPaymentFields
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
