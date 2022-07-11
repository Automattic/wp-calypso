import { FormStatus, useFormStatus, useIsStepActive } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useCachedContactDetails } from '../hooks/use-cached-contact-details';
import { useCachedContactDetailsForCheckoutForm } from '../hooks/use-cached-contact-details-for-checkout-form';
import ContactDetailsContainer from './contact-details-container';
import type {
	CountryListItem,
	ContactDetailsType,
	ManagedContactDetails,
} from '@automattic/wpcom-checkout';

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
	isLoggedOutCart,
}: {
	countriesList: CountryListItem[];
	shouldShowContactDetailsValidationErrors: boolean;
	contactDetailsType: Exclude< ContactDetailsType, 'none' >;
	isLoggedOutCart: boolean;
} ) {
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);
	const { formStatus } = useFormStatus();
	const isStepActive = useIsStepActive();
	const isDisabled = ! isStepActive || formStatus !== FormStatus.READY;

	const { data, isFetching } = useCachedContactDetails();
	useCachedContactDetailsForCheckoutForm( isFetching ? null : data ?? null, countriesList );

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
