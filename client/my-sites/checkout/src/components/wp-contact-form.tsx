import { FormStatus, useFormStatus, useIsStepActive } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import useCachedDomainContactDetails from '../hooks/use-cached-domain-contact-details';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import ContactDetailsContainer from './contact-details-container';
import type { CountryListItem, ContactDetailsType } from '@automattic/wpcom-checkout';

const BillingFormFields = styled.div`
	margin-bottom: 16px;

	& .form-input-validation {
		padding: 6px 6px 11px;
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

	useCachedDomainContactDetails( setShouldShowContactDetailsValidationErrors, countriesList );

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
