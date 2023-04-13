import { StripeHookProvider } from '@automattic/calypso-stripe';
import { Modal } from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CheckoutMasterbar from 'calypso/layout/masterbar/checkout';
import { navigate } from 'calypso/lib/navigate';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/composite-checkout/components/checkout-main';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route.js';
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
	redirectTo?: string;
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
	redirectTo,
	checkoutOnSuccessCallback,
	onClose,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { siteSlug, selectedSiteId, hasSelectedSiteId, previousRoute, isJetpackNotAtomic } =
		useSelector( ( state ) => {
			const site = getSelectedSite( state );
			const selectedSiteId = getSelectedSiteId( state );
			const hasSelectedSiteId = selectedSiteId && siteId === selectedSiteId;
			const previousRoute = getPreviousRoute( state );

			return {
				siteSlug: site?.slug,
				selectedSiteId,
				hasSelectedSiteId,
				previousRoute: removeQueryArgs( previousRoute, KEY_PRODUCTS ),
				isJetpackNotAtomic:
					!! isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId ),
			};
		} );

	const handleRequestClose = () => {
		onClose?.();
		navigate( previousRoute );
	};

	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
		handleRequestClose();
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
			open
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
			/>
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ getStripeConfiguration }
					locale={ translate.localeSlug }
				>
					<CheckoutMain
						siteId={ selectedSiteId ?? undefined }
						siteSlug={ siteSlug }
						productAliasFromUrl={ productAliasFromUrl }
						// Custom thank-you URL for payments that are processed after a redirect (eg: Paypal)
						redirectTo={ redirectTo || previousRoute }
						customizedPreviousPath={ previousRoute }
						isInModal
						disabledThankYouPage
						onAfterPaymentComplete={ handleAfterPaymentComplete }
					/>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</Modal>
	);
};

export default CheckoutModal;
