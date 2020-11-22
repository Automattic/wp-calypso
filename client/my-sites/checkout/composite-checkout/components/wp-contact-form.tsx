/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import {
	FormStatus,
	useSelect,
	useFormStatus,
	useIsStepActive,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import useSkipToLastStepIfFormComplete from '../hooks/use-skip-to-last-step-if-form-complete';
import useIsCachedContactFormValid from '../hooks/use-is-cached-contact-form-valid';
import ContactDetailsContainer from './contact-details-container';
import type { CountryListItem } from '../types/country-list-item';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import type { ContactDetailsType } from '../types/contact-details';

const BillingFormFields = styled.div`
	margin-bottom: 16px;

	.form-input-validation {
		padding: 6px 6px 11px;
	}

	.form-input-validation .gridicon {
		float: none;
		margin-left: 0;
		width: 18px;
		vertical-align: text-top;
		height: 18px;
	}
`;

export default function WPContactForm( {
	countriesList,
	shouldShowContactDetailsValidationErrors,
	contactDetailsType,
	contactValidationCallback,
	isLoggedOutCart,
}: {
	countriesList: CountryListItem[];
	shouldShowContactDetailsValidationErrors: boolean;
	contactDetailsType: Exclude< ContactDetailsType, 'none' >;
	contactValidationCallback: () => Promise< boolean >;
	isLoggedOutCart: boolean;
} ): JSX.Element {
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom' ).getContactInfo()
	);
	const { formStatus } = useFormStatus();
	const isStepActive = useIsStepActive();
	const isDisabled = ! isStepActive || formStatus !== FormStatus.READY;
	const isCachedContactFormValid = useIsCachedContactFormValid( contactValidationCallback );

	useSkipToLastStepIfFormComplete( isCachedContactFormValid );

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
