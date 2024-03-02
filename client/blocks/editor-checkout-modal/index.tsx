import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import * as React from 'react';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector } from 'calypso/state';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { RequestCart } from '@automattic/shopping-cart';

import './style.scss';

function removeHashFromUrl(): void {
	try {
		const newUrl = window.location.hash
			? window.location.href.replace( window.location.hash, '' )
			: window.location.href;

		window.history.replaceState( null, '', newUrl );
	} catch {}
}

const EditorCheckoutModal: React.FunctionComponent< Props > = ( props ) => {
	const { isOpen, onClose, cartData, redirectTo, isFocusedLaunch, checkoutOnSuccessCallback } =
		props;

	const translate = useTranslate();

	const site = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );

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

	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
	};

	return isOpen ? (
		<Modal
			overlayClassName="editor-checkout-modal"
			onRequestClose={ onClose }
			title={ String( translate( 'Checkout modal' ) ) }
			shouldCloseOnClickOutside={ false }
			icon={ <Icon icon={ wordpress } size={ 36 } /> }
		>
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ getStripeConfiguration }
					locale={ translate.localeSlug }
				>
					<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
						<CheckoutMain
							redirectTo={ redirectTo } // custom thank-you URL for payments that are processed after a redirect (eg: Paypal)
							isInModal
							disabledThankYouPage={ isFocusedLaunch }
							siteId={ selectedSiteId ?? undefined }
							siteSlug={ site?.slug }
							productAliasFromUrl={ commaSeparatedProductSlugs }
							productSourceFromUrl="editor-checkout-modal"
							onAfterPaymentComplete={ handleAfterPaymentComplete }
						/>
					</RazorpayHookProvider>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</Modal>
	) : null;
};

interface Props {
	onClose: () => void;
	isOpen: boolean;
	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
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
