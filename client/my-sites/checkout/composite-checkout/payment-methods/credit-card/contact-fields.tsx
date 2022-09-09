import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useSelect } from '@wordpress/data';
import TaxFields from 'calypso/my-sites/checkout/composite-checkout/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import { CountrySpecificPaymentFields } from '../../components/country-specific-payment-fields';

export default function ContactFields( {
	getFieldValue,
	setFieldValue,
	getErrorMessagesForField,
	shouldUseEbanx,
	shouldShowTaxFields,
}: {
	getFieldValue: ( key: string ) => string;
	setFieldValue: ( key: string, value: string ) => void;
	getErrorMessagesForField: ( key: string ) => string[];
	shouldUseEbanx?: boolean;
	shouldShowTaxFields?: boolean;
} ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList();
	const fields = useSelect( ( select ) => select( 'wpcom-credit-card' ).getFields() );
	const onChangeContactInfo = ( newInfo: {
		countryCode?: { value?: string };
		postalCode?: { value?: string };
	} ) => {
		setFieldValue( 'countryCode', newInfo.countryCode?.value ?? '' );
		setFieldValue( 'postalCode', newInfo.postalCode?.value ?? '' );
	};

	return (
		<div className="contact-fields">
			{ shouldUseEbanx && ! shouldShowTaxFields && (
				<CountrySpecificPaymentFields
					countryCode={ getFieldValue( 'countryCode' ) }
					countriesList={ countriesList }
					getErrorMessages={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ setFieldValue }
					disableFields={ isDisabled }
				/>
			) }
			{ shouldShowTaxFields && ! shouldUseEbanx && (
				<TaxFields
					section="update-to-new-card"
					taxInfo={ fields }
					onChange={ onChangeContactInfo }
					countriesList={ countriesList }
					isDisabled={ isDisabled }
				/>
			) }
		</div>
	);
}
