import { FormStatus, useFormStatus, useIsStepActive } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import useCachedDomainContactDetails from '../hooks/use-cached-domain-contact-details';
import ContactDetailsContainer from './contact-details-container';
import type { WpcomCheckoutStoreSelectors } from '../hooks/wpcom-store';
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
	setShouldShowContactDetailsValidationErrors,
}: {
	countriesList: CountryListItem[];
	shouldShowContactDetailsValidationErrors: boolean;
	contactDetailsType: Exclude< ContactDetailsType, 'none' >;
	isLoggedOutCart: boolean;
	setShouldShowContactDetailsValidationErrors: ( allowed: boolean ) => void;
} ) {
	const contactInfo: ManagedContactDetails = useSelect(
		( select ) =>
			( select( 'wpcom-checkout' ) as WpcomCheckoutStoreSelectors )?.getContactInfo() ?? {},
		[]
	);
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
