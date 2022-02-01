import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useSelect } from '@wordpress/data';
import TaxFields from 'calypso/my-sites/checkout/composite-checkout/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import CountrySpecificPaymentFields from '../../components/country-specific-payment-fields';

export default function ContactFields( {
	getFieldValue,
	setFieldValue,
	getErrorMessagesForField,
	shouldUseEbanx,
	shouldShowTaxFields,
} ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList( [] );
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );

	return (
		<div className="contact-fields">
			{ shouldUseEbanx && ! shouldShowTaxFields && (
				<CountrySpecificPaymentFields
					countryCode={ getFieldValue( 'countryCode' ) }
					countriesList={ countriesList }
					getErrorMessage={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ setFieldValue }
					disableFields={ isDisabled }
				/>
			) }
			{ shouldShowTaxFields && ! shouldUseEbanx && (
				<TaxFields
					section="update-to-new-card"
					taxInfo={ fields }
					countriesList={ countriesList }
					isDisabled={ isDisabled }
					updateCountryCode={ ( value ) => setFieldValue( 'countryCode', value ) }
					updatePostalCode={ ( value ) => setFieldValue( 'postalCode', value ) }
				/>
			) }
		</div>
	);
}
