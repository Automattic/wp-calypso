import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart, convertTaxLocationToLocationUpdate } from '@automattic/shopping-cart';
import { hasCheckoutVersion, styled } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import useCartKey from '../../use-cart-key';
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
export function IsForBusinessCheckbox() {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();

	const cartKey = useCartKey();
	const { responseCart, updateLocation, isLoading, isPendingUpdate } = useShoppingCart( cartKey );

	const isUnitedStateWithBusinessOption = ( () => {
		if ( responseCart.tax.location.country_code !== 'US' ) {
			return false;
		}
		const zipCode = parseInt( responseCart.tax.location.postal_code ?? '0', 10 );
		if ( zipCode >= 43000 && zipCode <= 45999 ) {
			// Ohio; OH
			return true;
		}
		if ( ( zipCode >= 6000 && zipCode <= 6389 ) || ( zipCode >= 6391 && zipCode <= 6999 ) ) {
			// Connecticut; CT
			return true;
		}
		return false;
	} )();

	const isChecked = responseCart.tax.location.is_for_business ?? false;
	const isDisabled = formStatus !== FormStatus.READY || isLoading || isPendingUpdate;

	if ( ! isUnitedStateWithBusinessOption || ! hasCheckoutVersion( 'business-use-tax' ) ) {
		return null;
	}

	return (
		<CheckboxWrapper>
			<CheckboxControl
				id="checkout-is-business-checkbox"
				label={
					translate(
						'Is this purchase for business? {{link}}Learn more.{{/link}}',
						{
							components: {
								link: (
									<InlineSupportLink
										id="checkout-is-business-checkbox"
										supportContext="tax-exempt-customers"
										showIcon={ false }
									/>
								),
							},
						}
						// As far as I can tell, label will correctly render the
						// component, so we cast to string to make the types work.
					) as string
				}
				checked={ isChecked }
				disabled={ isDisabled }
				onChange={ ( newValue ) => {
					if ( isDisabled ) {
						return;
					}
					updateLocation( {
						...convertTaxLocationToLocationUpdate( responseCart.tax.location ),
						isForBusiness: newValue,
					} );
				} }
			/>
		</CheckboxWrapper>
	);
}
