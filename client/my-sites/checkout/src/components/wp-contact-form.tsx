import { FormStatus, useFormStatus, useIsStepActive } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { usePrefillCheckoutContactForm } from '../hooks/use-prefill-checkout-contact-form';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import ContactDetailsContainer from './contact-details-container';
import type { CountryListItem, ContactDetailsType } from '@automattic/wpcom-checkout';

const BillingFormFields = styled.div`
	margin-bottom: 16px;

	& input,
	input[type='text'].form-text-input,
	input[type='textarea'].form-textarea-input,
	input[type='url'].form-text-input,
	input[type='password'].form-text-input,
	input[type='email'].form-text-input,
	input[type='tel'].form-text-input,
	input[type='number'].form-text-input,
	input[type='search'].form-text-input,
	.form-select,
	.form-fieldset.contact-details-form-fields select {
		border-radius: 3px;
	}

	& .form-input-validation {
		padding: 6px 6px 11px 0;
	}

	& .form-input-validation .gridicon,
	& .form-input-validation svg {
		float: none;
		margin-left: 0;
		margin-right: 2px;
		width: 18px;
		vertical-align: text-top;
		height: 18px;

		.rtl & {
			margin-left: 2px;
			margin-right: 0;
		}
	}
`;

export default function WPContactForm( {
	countriesList,
	shouldShowContactDetailsValidationErrors,
	contactDetailsType,
	isLoggedOutCart,
	setShouldShowContactDetailsValidationErrors,
}: {
	countriesList: CountryListItem[];
	shouldShowContactDetailsValidationErrors: boolean;
	contactDetailsType: Exclude< ContactDetailsType, 'none' >;
	isLoggedOutCart: boolean;
	setShouldShowContactDetailsValidationErrors: ( allowed: boolean ) => void;
} ) {
	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );
	const { formStatus } = useFormStatus();
	const isStepActive = useIsStepActive();
	const isDisabled = ! isStepActive || formStatus !== FormStatus.READY;

	usePrefillCheckoutContactForm( {
		setShouldShowContactDetailsValidationErrors,
		isLoggedOut: isLoggedOutCart,
	} );

	return (
		<BillingFormFields>
			<ContactDetailsContainer
				contactDetailsType={ contactDetailsType }
				contactInfo={ contactInfo }
				countriesList={ countriesList }
				shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
				isDisabled={ isDisabled }
				isLoggedOutCart={ isLoggedOutCart }
			/>
		</BillingFormFields>
	);
}
