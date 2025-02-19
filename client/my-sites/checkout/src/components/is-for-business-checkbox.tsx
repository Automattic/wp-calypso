import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { hasCheckoutVersion, ManagedContactDetails, styled } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { CHECKOUT_STORE } from '../lib/wpcom-store';

// Styled component for checkbox styles
const CheckboxWrapper = styled.div`
	margin-top: 16px;

	#checkout-is-business-checkbox input[type='checkbox']:checked {
		background: ${ ( props ) => props.theme.colors.primary };
		border-color: ${ ( props ) => props.theme.colors.primary };
	}

	a.inline-support-link#checkout-is-business-checkbox__link {
		color: ${ ( props ) => props.theme.colors.primary };
	}
`;

/**
 * Determines if the business purchase option should be available based on country and postal code.
 * @param {ManagedContactDetails} taxInfo - The tax information object containing country and postal code.
 * @returns {boolean} - True if the option should be available, false otherwise.
 */
function shouldShowBusinessOption( taxInfo: ManagedContactDetails ): boolean {
	const { postalCode, countryCode } = taxInfo;
	if ( countryCode?.value !== 'US' ) {
		return false;
	}
	const zipCode = parseInt( postalCode?.value ?? '0', 10 );
	return (
		( zipCode >= 43000 && zipCode <= 45999 ) || // Ohio (OH)
		( zipCode >= 6000 && zipCode <= 6389 ) ||
		( zipCode >= 6391 && zipCode <= 6999 ) // Connecticut (CT)
	);
}

/**
 * Renders a checkbox for users to indicate if the purchase is for business purposes.
 * The checkbox is only shown for eligible locations.
 */
export function IsForBusinessCheckbox( { taxInfo }: { taxInfo: ManagedContactDetails } ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const businessUseDetailsInForm = useSelect(
		( select ) => select( CHECKOUT_STORE ).getBusinessUseDetails(),
		[]
	);
	const wpcomStoreActions = useDispatch( CHECKOUT_STORE );
	const setBusinessUseDetailsInForm = wpcomStoreActions?.setBusinessUseDetails;

	// Determine if the checkbox should be shown
	const isUnitedStateWithBusinessOption = shouldShowBusinessOption( taxInfo );

	// Ensure the checkbox state is always a boolean
	const isChecked = Boolean( businessUseDetailsInForm?.is_for_business );
	const isDisabled = formStatus !== FormStatus.READY;

	// Hide checkbox if not eligible
	if ( ! isUnitedStateWithBusinessOption || ! hasCheckoutVersion( 'business-use-tax' ) ) {
		return null;
	}

	return (
		<CheckboxWrapper>
			<CheckboxControl
				id="checkout-is-business-checkbox"
				label={
					translate( 'Is this purchase for business? {{link}}Learn more.{{/link}}', {
						components: {
							link: (
								<InlineSupportLink
									id="checkout-is-business-checkbox"
									supportContext="tax-exempt-customers"
									showIcon={ false }
								/>
							),
						},
					} ) as string
				}
				checked={ isChecked }
				disabled={ isDisabled }
				onChange={ ( newValue ) => {
					if ( isDisabled ) {
						return;
					}
					setBusinessUseDetailsInForm( {
						is_for_business: newValue,
					} );
				} }
			/>
		</CheckboxWrapper>
	);
}
