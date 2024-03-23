import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart, convertTaxLocationToLocationUpdate } from '@automattic/shopping-cart';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useCartKey from '../../use-cart-key';

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

	if ( ! isUnitedStateWithBusinessOption ) {
		return null;
	}

	return (
		<CheckboxControl
			id="checkout-is-business-checkbox"
			label={ translate( 'Is this purchase for business?', { textOnly: true } ) }
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
	);
}
