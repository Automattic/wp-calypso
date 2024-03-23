import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useCartKey from '../../use-cart-key';

export function IsForBusinessCheckbox() {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();

	const cartKey = useCartKey();
	const { responseCart, updateLocation, isLoading, isPendingUpdate } = useShoppingCart( cartKey );

	const isChecked = responseCart.tax.location.is_for_business ?? false;
	const isDisabled = formStatus !== FormStatus.READY && ! isLoading && ! isPendingUpdate;

	return (
		<CheckboxControl
			id="checkout-is-business-checkbox"
			label={ translate( 'Is this purchase for business?', { textOnly: true } ) }
			checked={ isChecked }
			disabled={ isDisabled }
			onChange={ ( newValue ) => {
				updateLocation( {
					...responseCart.tax.location,
					isForBusiness: newValue,
				} );
			} }
		/>
	);
}
