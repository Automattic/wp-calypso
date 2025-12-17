import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { getStripeConfiguration, getRazorpayConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import ClientCheckoutV2Error from '../../checkout-v2-error';
import ClientCheckoutV2Placeholder from '../../checkout-v2-placeholder';
import useClientCheckout from '../../hooks/use-client-checkout';

function ClientExpressCheckoutContent() {
	const translate = useTranslate();

	const { isReady, error } = useClientCheckout( { expressMode: true } );

	if ( ! isReady ) {
		return <ClientCheckoutV2Placeholder />;
	}

	if ( error ) {
		return <ClientCheckoutV2Error title={ translate( 'Error' ) } message={ error } />;
	}

	return (
		<CheckoutMain
			sitelessCheckoutType="a4a"
			redirectTo="https://agencies.automattic.com/client/subscriptions"
			customizedPreviousPath="https://agencies.automattic.com/client/subscriptions"
			isLoggedOutCart
			siteSlug=""
			siteId={ 0 }
		/>
	);
}

export default function ClientExpressCheckout() {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CalypsoShoppingCartProvider shouldShowPersistentErrors>
				<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
					<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
						<ClientExpressCheckoutContent />
					</RazorpayHookProvider>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
