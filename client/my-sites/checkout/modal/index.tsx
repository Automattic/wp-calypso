import { StripeHookProvider } from '@automattic/calypso-stripe';
import { useShoppingCart } from '@automattic/shopping-cart';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CompositeCheckout from 'calypso/my-sites/checkout/composite-checkout/composite-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { RequestCartProduct } from '@automattic/shopping-cart';

import './style.scss';

interface Props {
	isOpen: boolean;
	cartProducts?: RequestCartProduct[];
	redirectTo?: string;
	clearCartOnClose?: boolean;
	disabledRemoveProductFromCart?: boolean;
	checkoutOnSuccessCallback?: () => void;
	onClose?: () => void;
}

const removeHashFromUrl = () => {
	if ( window.location.hash ) {
		return;
	}

	try {
		const newUrl = window.location.href.replace( window.location.hash, '' );
		window.history.replaceState( null, '', newUrl );
	} catch {}
};

const CheckoutModal: React.FunctionComponent< Props > = ( {
	isOpen,
	cartProducts,
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

	// We need to pass in a comma separated list of product
	// slugs to be set in the cart otherwise we will be
	// redirected to the plans page due to an empty cart
	const productSlugs =
		// check if the cart is empty (i.e no products)
		cartProducts && cartProducts.length > 0
			? cartProducts.map( ( product ) => product.product_slug )
			: null;
	const commaSeparatedProductSlugs = productSlugs?.join( ',' );

	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
	};

	const handleRequestClose = () => {
		if ( clearCartOnClose ) {
			replaceProductsInCart( [] );
		}

		onClose?.();
	};

	useEffect( () => {
		if ( ! isOpen ) {
			removeHashFromUrl();
		}
	}, [ isOpen ] );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			open={ isOpen }
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
					productAliasFromUrl={ commaSeparatedProductSlugs }
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

const CheckoutModalWrapper = ( props: Props ) => (
	<CalypsoShoppingCartProvider>
		<CheckoutModal { ...props } />
	</CalypsoShoppingCartProvider>
);

export default CheckoutModalWrapper;
