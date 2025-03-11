import { FormStatus, useFormStatus, useIsStepActive } from '@automattic/composite-checkout';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { usePrefillCheckoutContactForm } from '../hooks/use-prefill-checkout-contact-form';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import ContactDetailsContainer from './contact-details-container';
import type { CountryListItem, ContactDetailsType } from '@automattic/wpcom-checkout';

interface BillingFormFieldsProps {
	isLoading: boolean;
}

const BillingFormFields = styled.div< BillingFormFieldsProps >`
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

	${ ( props ) =>
		props.isLoading &&
		css`
			+ button {
				display: none;
			}
		` }
`;

const LoadingText = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
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
	const translate = useTranslate();
	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );
	const { formStatus } = useFormStatus();
	const isStepActive = useIsStepActive();
	const isDisabled = ! isStepActive || formStatus !== FormStatus.READY;

	const hasCompleted = usePrefillCheckoutContactForm( {
		setShouldShowContactDetailsValidationErrors,
		isLoggedOut: isLoggedOutCart,
	} );

	return (
		<BillingFormFields isLoading={ ! hasCompleted }>
			{ hasCompleted ? (
				<ContactDetailsContainer
					contactDetailsType={ contactDetailsType }
					contactInfo={ contactInfo }
					countriesList={ countriesList }
					shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
					isDisabled={ isDisabled }
					isLoggedOutCart={ isLoggedOutCart }
				/>
			) : (
				<LoadingText>{ translate( 'Retrieving contact details…' ) }</LoadingText>
			) }
		</BillingFormFields>
	);
}
