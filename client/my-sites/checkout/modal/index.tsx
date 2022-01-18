import { StripeHookProvider } from '@automattic/calypso-stripe';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import CheckoutMasterbar from 'calypso/layout/masterbar/checkout';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CompositeCheckout from 'calypso/my-sites/checkout/composite-checkout/composite-checkout';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route.js';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	title?: string;
	redirectTo?: string;
	checkoutOnSuccessCallback?: () => void;
	onClose?: () => void;
}

const useProducts = () => {
	const { search } = window.location;
	const products = useMemo( () => new URLSearchParams( search ).get( 'products' ), [ search ] );

	return products;
};

const CheckoutModal: FunctionComponent< Props > = ( {
	title = '',
	redirectTo,
	checkoutOnSuccessCallback,
	onClose,
} ) => {
	const translate = useTranslate();
	const products = useProducts();
	const { siteSlug, selectedSiteId, previousRoute, isJetpackNotAtomic } = useSelector(
		( state ) => {
			const site = getSelectedSite( state );
			const selectedSiteId = getSelectedSiteId( state );

			return {
				siteSlug: site?.slug,
				selectedSiteId,
				previousRoute: getPreviousRoute( state ),
				isJetpackNotAtomic:
					!! isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId ),
			};
		}
	);

	const handleRequestClose = () => {
		onClose?.();
		window.history.back();
	};

	const handleAfterPaymentComplete = () => {
		checkoutOnSuccessCallback?.();
		handleRequestClose();
	};

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
			onRequestClose={ handleRequestClose }
		>
			<CheckoutMasterbar
				title={ title }
				siteSlug={ siteSlug }
				previousPath={ previousRoute }
				isJetpackNotAtomic={ isJetpackNotAtomic }
			/>
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ getStripeConfiguration }
					locale={ translate.localeSlug }
				>
					<CompositeCheckout
						siteId={ selectedSiteId ?? undefined }
						siteSlug={ siteSlug }
						productAliasFromUrl={ products }
						// Custom thank-you URL for payments that are processed after a redirect (eg: Paypal)
						redirectTo={ redirectTo || previousRoute }
						backUrl={ previousRoute }
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
