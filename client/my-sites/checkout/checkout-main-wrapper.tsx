import config from '@automattic/calypso-config';
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import colorStudio from '@automattic/color-studio';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { getStripeConfiguration, getRazorpayConfiguration } from 'calypso/lib/store-transactions';
import Recaptcha from 'calypso/signup/recaptcha';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useVisitorId } from '../../lib/fingerprintjs/hooks/use-visitor-id';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';
import CheckoutMain from './src/components/checkout-main';
import { logStashLoadErrorEvent } from './src/lib/analytics';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';

const logCheckoutError = ( error: Error ) => {
	logStashLoadErrorEvent( 'checkout_system_decider', error );
};

const CheckoutMainWrapperStyles = styled.div`
	background-color: ${ colorStudio.colors[ 'White' ] };
`;

export default function CheckoutMainWrapper( {
	productAliasFromUrl,
	productSourceFromUrl,
	purchaseId,
	selectedFeature,
	couponCode,
	isComingFromUpsell,
	plan,
	selectedSite,
	redirectTo,
	sitelessCheckoutType,
	isLoggedOutCart,
	isNoSiteCart,
	isGiftPurchase,
	jetpackSiteSlug,
	jetpackPurchaseToken,
	isUserComingFromLoginForm,
	connectAfterCheckout,
	fromSiteSlug,
	adminUrl,
}: {
	productAliasFromUrl?: string;
	productSourceFromUrl?: string;
	purchaseId?: number;
	selectedFeature?: string;
	couponCode?: string;
	isComingFromUpsell?: boolean;
	plan?: string;
	selectedSite?: { slug?: string };
	redirectTo?: string;
	sitelessCheckoutType: SitelessCheckoutType;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	isGiftPurchase?: boolean;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
	isUserComingFromLoginForm?: boolean;
	connectAfterCheckout?: boolean;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
	adminUrl?: string;
} ) {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const visitorId = useVisitorId();
	// eslint-disable-next-line no-console
	console.log( { visitorId } );

	useEffect( () => {
		if ( productAliasFromUrl ) {
			logToLogstash( {
				feature: 'calypso_client',
				message: 'CheckoutMainWrapper saw productSlug to add',
				severity: config( 'env_id' ) === 'production' ? 'info' : 'debug',
				extra: {
					productSlug: productAliasFromUrl,
				},
			} );
		}
	}, [ productAliasFromUrl ] );

	let siteSlug = selectedSite?.slug;

	if ( ! siteSlug ) {
		siteSlug = 'no-site';

		/*
		 * As Gifting purchases are for sites, we avoid to use no-user.
		 */
		if ( ( ! isGiftPurchase && isLoggedOutCart ) || isNoSiteCart ) {
			siteSlug = 'no-user';
		}
	}

	return (
		<CheckoutMainWrapperStyles>
			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logCheckoutError }
			>
				<CalypsoShoppingCartProvider shouldShowPersistentErrors>
					<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
						<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
							<CheckoutMain
								siteSlug={ siteSlug }
								siteId={ selectedSiteId }
								productAliasFromUrl={ productAliasFromUrl }
								productSourceFromUrl={ productSourceFromUrl }
								purchaseId={ purchaseId }
								couponCode={ couponCode }
								redirectTo={ redirectTo }
								feature={ selectedFeature }
								plan={ plan }
								isComingFromUpsell={ isComingFromUpsell }
								sitelessCheckoutType={ sitelessCheckoutType }
								isLoggedOutCart={ isLoggedOutCart }
								isNoSiteCart={ isNoSiteCart }
								isGiftPurchase={ isGiftPurchase }
								jetpackSiteSlug={ jetpackSiteSlug }
								jetpackPurchaseToken={ jetpackPurchaseToken }
								isUserComingFromLoginForm={ isUserComingFromLoginForm }
								connectAfterCheckout={ connectAfterCheckout }
								fromSiteSlug={ fromSiteSlug }
								adminUrl={ adminUrl }
							/>
						</RazorpayHookProvider>
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			</CheckoutErrorBoundary>
			{ isLoggedOutCart && <Recaptcha badgePosition="bottomright" /> }
		</CheckoutMainWrapperStyles>
	);
}
