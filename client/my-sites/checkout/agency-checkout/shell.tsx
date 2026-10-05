import { StripeHookProvider } from '@automattic/calypso-stripe';
import { LoadingPlaceholder } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import CalypsoShoppingCartProvider from '../calypso-shopping-cart-provider';
import CheckoutQueryClientProvider from '../checkout-query-client-provider';
import CartMessageCleanup from '../src/components/cart-message-cleanup';
import type { ReactNode } from 'react';

import './style.scss';

export function AgencyCheckoutPlaceholder() {
	return (
		<div className="agency-checkout__placeholder">
			<LoadingPlaceholder width="50%" height="32px" borderRadius="4px" />
			<LoadingPlaceholder width="70%" height="32px" borderRadius="4px" delayMS={ 150 } />
			<LoadingPlaceholder width="50%" height="32px" borderRadius="4px" delayMS={ 300 } />
		</div>
	);
}

/**
 * Everything the WordPress.com checkout needs around it when an agency pays
 * from its dashboard, shared by the siteless cart and the site checkouts.
 */
export function AgencyCheckoutShell( { children }: { children: ReactNode } ) {
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
						{ children }
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			</CheckoutQueryClientProvider>
		</CheckoutErrorBoundary>
	);
}
