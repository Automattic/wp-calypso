import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { Modal } from '@wordpress/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import CheckoutMasterbar from 'calypso/layout/masterbar/checkout';
import { navigate } from 'calypso/lib/navigate';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector, useDispatch } from 'calypso/state';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { KEY_PRODUCTS } from './constants';
import type { FunctionComponent } from 'react';

import './style.scss';

export interface Props {
	title?: string;
	siteId?: number;
	productAliasFromUrl?: string;
	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	checkoutOnSuccessCallback?: () => void;
	onClose?: () => void;
	navigate?: ( path: string ) => void;
}

const CheckoutModal: FunctionComponent< Props > = ( {
	title = '',
	siteId,
	productAliasFromUrl,
	checkoutOnSuccessCallback,
	onClose,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const hasSelectedSiteId = selectedSiteId && siteId === selectedSiteId;
	const previousRouteWithArgs = useSelector( getPreviousRoute );
	const siteSlug = site?.slug;
	const previousRoute = removeQueryArgs( previousRouteWithArgs, KEY_PRODUCTS );
	const hostingIntent = getQueryArg( window.location.href, 'hosting_intent' ) as string;

	const redirectTo =
		( getQueryArg( window.location.href, 'redirect_to' ) as string ) || previousRouteWithArgs;
	const cancelTo =
		( getQueryArg( window.location.href, 'cancel_to' ) as string ) || previousRouteWithArgs;
	const isJetpackNotAtomic = useSelector(
		( state ) =>
			!! isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);

	const handleRequestClose = () => {
		onClose?.();
		navigate( cancelTo );
	};

	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
		onClose?.();

		// Reload the page to get latest data
		window.location.href = redirectTo;
	};

	useEffect( () => {
		if ( ! hasSelectedSiteId && siteId ) {
			dispatch( setSelectedSiteId( siteId ) );
		}
	}, [ hasSelectedSiteId, siteId ] );

	if ( ! hasSelectedSiteId ) {
		return null;
	}

	return (
		<Modal
			overlayClassName="checkout-modal"
			bodyOpenClassName="has-checkout-modal"
			title={ translate( 'Checkout modal' ) }
			shouldCloseOnClickOutside={ false }
			onRequestClose={ handleRequestClose }
		>
			<CheckoutMasterbar
				title={ title }
				siteSlug={ siteSlug }
				previousPath={ previousRoute }
				isJetpackNotAtomic={ isJetpackNotAtomic }
				isLeavingAllowed
				loadHelpCenterIcon
			/>
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ getStripeConfiguration }
					locale={ translate.localeSlug }
				>
					<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
						<CheckoutMain
							siteId={ selectedSiteId ?? undefined }
							siteSlug={ siteSlug }
							productAliasFromUrl={ productAliasFromUrl }
							// Custom thank-you URL for payments that are processed after a redirect (eg: Paypal)
							redirectTo={ redirectTo }
							customizedPreviousPath={ previousRoute }
							isInModal
							disabledThankYouPage
							onAfterPaymentComplete={ handleAfterPaymentComplete }
							hostingIntent={ hostingIntent }
						/>
					</RazorpayHookProvider>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</Modal>
	);
};

export default CheckoutModal;
