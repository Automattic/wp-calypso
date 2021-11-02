import { StripeHookProvider } from '@automattic/calypso-stripe';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import wp from 'calypso/lib/wp';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CompositeCheckout from 'calypso/my-sites/checkout/composite-checkout/composite-checkout';
import { fetchStripeConfiguration } from 'calypso/my-sites/checkout/composite-checkout/payment-method-helpers';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { RequestCart } from '@automattic/shopping-cart';

import './style.scss';

function fetchStripeConfigurationWpcom( args: Record< string, unknown > ) {
	return fetchStripeConfiguration( args, wp );
}

function removeHashFromUrl(): void {
	try {
		const newUrl = window.location.hash
			? window.location.href.replace( window.location.hash, '' )
			: window.location.href;

		window.history.replaceState( null, '', newUrl );
	} catch {}
}

const EditorCheckoutModal: React.FunctionComponent< Props > = ( props ) => {
	const {
		isOpen,
		onClose,
		cartData,
		redirectTo,
		isFocusedLaunch,
		checkoutOnSuccessCallback,
	} = props;

	const translate = useTranslate();

	const site = useSelector( getSelectedSite );

	useEffect( () => {
		return () => {
			// Remove the hash e.g. #step2 from the url
			// when the component is going to unmount.
			removeHashFromUrl();
		};
	}, [] );

	// We need to pass in a comma separated list of product
	// slugs to be set in the cart otherwise we will be
	// redirected to the plans page due to an empty cart
	const productSlugs =
		// check if the cart is empty (i.e no products)
		! cartData?.products || cartData.products.length < 1
			? null
			: cartData.products.map( ( product ) => product.product_slug );
	const commaSeparatedProductSlugs = productSlugs?.join( ',' );

	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
	};

	return isOpen ? (
		<Modal
			open={ isOpen }
			overlayClassName="editor-checkout-modal"
			onRequestClose={ onClose }
			title={ String( translate( 'Checkout modal' ) ) }
			shouldCloseOnClickOutside={ false }
			icon={ <Icon icon={ wordpress } size={ 29 } /> }
		>
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ fetchStripeConfigurationWpcom }
					locale={ translate.locale }
				>
					<CompositeCheckout
						redirectTo={ redirectTo } // custom thank-you URL for payments that are processed after a redirect (eg: Paypal)
						isInEditor
						isFocusedLaunch={ isFocusedLaunch }
						siteId={ site?.ID }
						siteSlug={ site?.slug }
						productAliasFromUrl={ commaSeparatedProductSlugs }
						onAfterPaymentComplete={ handleAfterPaymentComplete }
					/>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</Modal>
	) : null;
};

interface Props {
	onClose: () => void;
	isOpen: boolean;
	checkoutOnSuccessCallback?: () => void;
	isFocusedLaunch?: boolean;
	cartData?: RequestCart;
	redirectTo?: string;
}

EditorCheckoutModal.defaultProps = {
	isOpen: false,
	onClose: () => {
		return;
	},
};

export default EditorCheckoutModal;
