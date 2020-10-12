/**
 * External dependencies
 */
import React from 'react';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import useCountryList from 'my-sites/checkout/composite-checkout/hooks/use-country-list';
import { shouldRenderAdditionalCountryFields } from 'lib/checkout/processor-specific';
import CountrySpecificPaymentFields from '../../components/country-specific-payment-fields';

export default function ContactFields( {
	getFieldValue,
	setFieldValue,
	getErrorMessagesForField,
} ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList( [] );

	return (
		<div className="contact-fields">
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
