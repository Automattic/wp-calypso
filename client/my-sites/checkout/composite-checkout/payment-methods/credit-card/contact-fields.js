/**
 * External dependencies
 */
import React from 'react';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import CountrySpecificPaymentFields from '../../components/country-specific-payment-fields';

export default function ContactFields( {
	getFieldValue,
	setFieldValue,
	getErrorMessagesForField,
	shouldUseEbanx,
} ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList( [] );

	return (
		<div className="contact-fields">
			{ shouldUseEbanx && (
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
