import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import ClientCheckoutV2Error from '../../checkout-v2-error';
import ClientCheckoutV2Placeholder from '../../checkout-v2-placeholder';
import useClientCheckout from '../../hooks/use-client-checkout';
import getClientCheckoutRedirectUrl from '../../lib/get-client-checkout-redirect-url';

import './style.scss';

/**
 * Client Checkout Component using the WordPress.com checkout
 */
function ClientCheckoutContent() {
	const translate = useTranslate();

	const { isReady, error, emailMismatchWithReferralClient, referral, wpcomHostingProductSlug } =
		useClientCheckout( {
			expressMode: false,
		} );

	const subscriptionsUrl = window.location.origin + '/client/subscriptions';
	const redirectTo = getClientCheckoutRedirectUrl( subscriptionsUrl, wpcomHostingProductSlug );

	if ( ! isReady ) {
		return <ClientCheckoutV2Placeholder />;
	}

	if ( emailMismatchWithReferralClient ) {
		return (
			<ClientCheckoutV2Error
				title={ translate( 'Permission denied' ) }
				message={ translate(
					'This referral is not intended for your account. Please make sure you sign in using {{b}}%(referralEmail)s{{/b}}.',
					{
						args: {
							referralEmail: referral?.client?.email,
						},
						components: {
							b: <b />,
						},
						comment: '%(referralEmail)s is the email of the referral client.',
					}
				) }
			/>
		);
	}

	if ( error ) {
		return <ClientCheckoutV2Error title={ translate( 'Error' ) } message={ error } />;
	}

	return (
		<div className="client-checkout-v2">
			<div className="client-checkout-v2__top-bar">
				<div className="client-checkout-v2__top-bar-logo">
					<A4ALogo full size={ 14 } />
				</div>
			</div>
			<CheckoutMain
				sitelessCheckoutType="a4a"
				redirectTo={ redirectTo }
				customizedPreviousPath="/client/subscriptions"
				siteSlug=""
				siteId={ 0 }
			/>
		</div>
	);
}

export default function ClientCheckoutV2() {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CalypsoShoppingCartProvider shouldShowPersistentErrors>
				<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
					<ClientCheckoutContent />
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
