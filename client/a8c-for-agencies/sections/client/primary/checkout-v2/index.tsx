import { fetchStripeConfiguration } from '@automattic/api-core';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import PressableCheckoutBack from 'calypso/a8c-for-agencies/sections/marketplace/billing-dragon-checkout/pressable-checkout-back';
import usePressableCheckoutReturn from 'calypso/a8c-for-agencies/sections/marketplace/billing-dragon-checkout/use-pressable-return-paths';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutQueryClientProvider from 'calypso/my-sites/checkout/checkout-query-client-provider';
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
function ClientCheckoutContent( { skipActiveCart }: { skipActiveCart: boolean } ) {
	const translate = useTranslate();

	const {
		isReady,
		error,
		emailMismatchWithReferralClient,
		referral,
		wpcomHostingProductSlug,
		preparedCartContext,
		products,
	} = useClientCheckout( { expressMode: false, skipActiveCart } );
	const { successPath, originalUrl } = usePressableCheckoutReturn(
		products,
		preparedCartContext?.agencyId,
		skipActiveCart,
		isReady,
		preparedCartContext
	);

	const subscriptionsUrl = window.location.origin + '/client/subscriptions';
	const redirectTo = getClientCheckoutRedirectUrl( subscriptionsUrl, wpcomHostingProductSlug );

	if (
		emailMismatchWithReferralClient &&
		referral?.client?.email &&
		( skipActiveCart || isReady )
	) {
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

	if ( error && ! originalUrl ) {
		return <ClientCheckoutV2Error title={ translate( 'Error' ) } message={ error } />;
	}
	if ( ! isReady && ! originalUrl ) {
		return <ClientCheckoutV2Placeholder />;
	}

	let checkoutContent = <ClientCheckoutV2Placeholder />;
	if ( error ) {
		checkoutContent = <ClientCheckoutV2Error title={ translate( 'Error' ) } message={ error } />;
	} else if ( isReady ) {
		checkoutContent = (
			<CheckoutMain
				sitelessCheckoutType="a4a"
				redirectTo={ successPath ?? redirectTo }
				customizedPreviousPath="/client/subscriptions"
				siteSlug=""
				siteId={ 0 }
			/>
		);
	}

	return (
		<div className="client-checkout-v2">
			<div
				className={
					originalUrl ? 'client-checkout-v2-pressable-top-bar' : 'client-checkout-v2__top-bar'
				}
			>
				{ originalUrl && preparedCartContext && (
					<PressableCheckoutBack
						key={ originalUrl }
						agencyId={ preparedCartContext.agencyId }
						afterPurchaseUrl={ originalUrl }
					/>
				) }
				<div className="client-checkout-v2__top-bar-logo">
					<A4ALogo full size={ 14 } />
				</div>
			</div>
			{ checkoutContent }
		</div>
	);
}

export default function ClientCheckoutV2( {
	skipActiveCart = false,
}: {
	skipActiveCart?: boolean;
} ) {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CheckoutQueryClientProvider>
				<CalypsoShoppingCartProvider shouldShowPersistentErrors>
					<StripeHookProvider
						fetchStripeConfiguration={ fetchStripeConfiguration }
						locale={ locale }
					>
						<ClientCheckoutContent skipActiveCart={ skipActiveCart } />
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			</CheckoutQueryClientProvider>
		</CheckoutErrorBoundary>
	);
}
