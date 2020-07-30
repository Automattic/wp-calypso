/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import CountrySelectMenu from 'my-sites/checkout/composite-checkout/wpcom/components/country-select-menu';
import useCountryList from 'my-sites/checkout/composite-checkout/wpcom/hooks/use-country-list';
import { isValid } from 'my-sites/checkout/composite-checkout/wpcom/types';
import { shouldRenderAdditionalCountryFields } from 'lib/checkout/processor-specific';
import CountrySpecificPaymentFields from 'my-sites/checkout/checkout/country-specific-payment-fields';

export default function ContactFields( {
	getField,
	getFieldValue,
	setFieldValue,
	getErrorMessagesForField,
} ) {
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = formStatus !== 'ready';
	const countriesList = useCountryList( [] );

	return (
		<div>
			<CountrySelectMenu
				translate={ __ }
				onChange={ ( event ) => {
					setFieldValue( 'countryCode', event.target.value );
				} }
				isError={ getField( 'countryCode' ).isTouched && ! isValid( getField( 'countryCode' ) ) }
				isDisabled={ isDisabled }
				errorMessage={ __( 'This field is required.' ) }
				currentValue={ getFieldValue( 'countryCode' ) }
				countriesList={ countriesList }
			/>
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
