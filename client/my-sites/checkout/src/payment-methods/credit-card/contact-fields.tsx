import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useSelect } from '@wordpress/data';
import TaxFields from 'calypso/my-sites/checkout/src/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { CountrySpecificPaymentFields } from '../../components/country-specific-payment-fields';
import { CardFieldState } from './types';
import type { WpcomCreditCardSelectors } from './store';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

export default function ContactFields( {
	getFieldValue,
	setFieldValue,
	setForBusinessUse,
	getErrorMessagesForField,
	shouldUseEbanx,
	shouldShowTaxFields,
}: {
	getFieldValue: ( key: string ) => string;
	setFieldValue: ( key: string, value: string ) => void;
	setForBusinessUse: ( newValue: boolean ) => void;
	getErrorMessagesForField: ( key: string ) => string[];
	shouldUseEbanx?: boolean;
	shouldShowTaxFields?: boolean;
} ) {
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList();
	const fields: CardFieldState = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getFields(),
		[]
	);
	const isForBusiness: boolean | undefined = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).useForBusiness(),
		[]
	);
	const onChangeContactInfo = ( newInfo: ManagedContactDetails ) => {
		setFieldValue( 'countryCode', newInfo.countryCode?.value ?? '' );
		setFieldValue( 'postalCode', newInfo.postalCode?.value ?? '' );
		setFieldValue( 'state', newInfo.state?.value ?? '' );
		setFieldValue( 'city', newInfo.city?.value ?? '' );
		setFieldValue( 'organization', newInfo.organization?.value ?? '' );
		setFieldValue( 'address1', newInfo.address1?.value ?? '' );
	};

	const handleIsForBusinessChange = ( newValue: boolean ): void => {
		setForBusinessUse( newValue );
	};

	return (
		<>
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
					allowIsForBusinessUseCheckbox
					handleIsForBusinessChange={ handleIsForBusinessChange }
					isForBusinessValue={ isForBusiness }
					countriesList={ countriesList }
					isDisabled={ isDisabled }
				/>
			) }
		</>
	);
}
