import { StripeHookProvider } from '@automattic/calypso-stripe';
import { useShoppingCart } from '@automattic/shopping-cart';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CompositeCheckout from 'calypso/my-sites/checkout/composite-checkout/composite-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import withCalypsoShoppingCartProvider from 'calypso/my-sites/checkout/with-calypso-shopping-cart-provider';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	redirectTo?: string;
	clearCartOnClose?: boolean;
	disabledRemoveProductFromCart?: boolean;
	checkoutOnSuccessCallback?: () => void;
	onClose?: () => void;
}

const useProducts = () => {
	const { search } = window.location;
	const products = useMemo( () => new URLSearchParams( search ).get( 'products' ), [ search ] );

	return products;
};

const CheckoutModal: FunctionComponent< Props > = ( {
	redirectTo,
	clearCartOnClose,
	disabledRemoveProductFromCart,
	checkoutOnSuccessCallback,
	onClose,
} ) => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const cartKey = useCartKey();
	const { replaceProductsInCart } = useShoppingCart( cartKey );
	const products = useProducts();

	const handleRequestClose = () => {
		onClose?.();
		window.history.back();
	};

	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
		handleRequestClose();
	};

	// Clear the products in cart when the component is going to unmount
	useEffect( () => {
		return () => {
			if ( clearCartOnClose ) {
				replaceProductsInCart( [] );
			}
		};
	}, [] );

	if ( ! products ) {
		return null;
	}

	return (
		<Modal
			open
			overlayClassName="checkout-modal"
			bodyOpenClassName="has-checkout-modal"
			title={ String( translate( 'Checkout modal' ) ) }
			shouldCloseOnClickOutside={ false }
			icon={ <Icon icon={ wordpress } size={ 36 } /> }
			onRequestClose={ handleRequestClose }
		>
			<StripeHookProvider
				fetchStripeConfiguration={ getStripeConfiguration }
				locale={ translate.localeSlug }
			>
				<CompositeCheckout
					siteId={ selectedSiteId ?? undefined }
					siteSlug={ site?.slug }
					productAliasFromUrl={ products }
					redirectTo={ redirectTo } // custom thank-you URL for payments that are processed after a redirect (eg: Paypal)
					isInModal
					disabledThankYouPage
					disabledRemoveProductFromCart={ disabledRemoveProductFromCart }
					onAfterPaymentComplete={ handleAfterPaymentComplete }
				/>
			</StripeHookProvider>
		</Modal>
	);
};

export default withCalypsoShoppingCartProvider( CheckoutModal );
