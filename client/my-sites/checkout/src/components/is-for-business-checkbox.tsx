import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { ManagedContactDetails, styled } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

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
export function IsForBusinessCheckbox( {
	taxInfo,
	isForBusiness,
	handleOnChange,
}: {
	taxInfo: ManagedContactDetails;
	isForBusiness: boolean;
	handleOnChange: ( newValue: boolean ) => void;
} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();

	// Determine if the checkbox should be shown
	const isUnitedStateWithBusinessOption = shouldShowBusinessOption( taxInfo );

	// Ensure the checkbox state is always a boolean
	const isChecked = isForBusiness;
	const isDisabled = formStatus !== FormStatus.READY;

	// Hide checkbox if not eligible
	if ( ! isUnitedStateWithBusinessOption ) {
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
									supportContext="business-tax-rates-in-ohio-and-connecticut"
									showIcon={ false }
								/>
							),
						},
					} ) as string
				}
				checked={ isChecked }
				disabled={ isDisabled }
				onChange={ ( newValue ) => ! isDisabled && handleOnChange( newValue ) }
				help={ isChecked && translate( 'Deselect to remove payment method filtering' ) }
			/>
		</CheckboxWrapper>
	);
}
