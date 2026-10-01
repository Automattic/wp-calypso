import { StripeHookProvider } from '@automattic/calypso-stripe';
import { LoadingPlaceholder } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import CalypsoShoppingCartProvider from '../calypso-shopping-cart-provider';
import CheckoutQueryClientProvider from '../checkout-query-client-provider';
import CartMessageCleanup from '../src/components/cart-message-cleanup';
import CheckoutMain from '../src/components/checkout-main';
import { getAgencyCheckoutParams } from './lib/agency-checkout-params';
import useAgencyCart from './use-agency-cart';

import './style.scss';

function Placeholder() {
	return (
		<div className="agency-siteless-checkout__placeholder">
			<LoadingPlaceholder width="50%" height="32px" borderRadius="4px" />
			<LoadingPlaceholder width="70%" height="32px" borderRadius="4px" delayMS={ 150 } />
			<LoadingPlaceholder width="50%" height="32px" borderRadius="4px" delayMS={ 300 } />
		</div>
	);
}

/**
 * An agency's own purchases from the Automattic for Agencies dashboard, paid
 * on WordPress.com without a site the way the client referral checkout is.
 * The cart, the page to return to after payment and the page the Back link
 * leads to arrive in the query string. The agency is the one of the user who is
 * logged in.
 */
function AgencySitelessCheckoutContent() {
	const translate = useTranslate();
	const { entries, term, redirectTo, cancelTo } = useMemo(
		() => getAgencyCheckoutParams( window.location.search ),
		[]
	);
	const { isReady, error } = useAgencyCart( entries, term );

	if ( error ) {
		return <EmptyContent title={ translate( 'Error' ) } line={ error } />;
	}

	if ( ! isReady ) {
		return <Placeholder />;
	}

	return (
		<CheckoutMain
			sitelessCheckoutType="a4a"
			redirectTo={ redirectTo }
			customizedPreviousPath={ cancelTo }
			siteSlug=""
			siteId={ 0 }
		/>
	);
}

export default function AgencySitelessCheckout() {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CheckoutQueryClientProvider>
				<CalypsoShoppingCartProvider shouldShowPersistentErrors>
					<CartMessageCleanup />
					<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
						<AgencySitelessCheckoutContent />
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			</CheckoutQueryClientProvider>
		</CheckoutErrorBoundary>
	);
}
