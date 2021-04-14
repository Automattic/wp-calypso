/**
 * External dependencies
 */
import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import debugFactory from 'debug';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { getEmptyResponseCart } from '@automattic/shopping-cart';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import PrePurchaseNotices from './composite-checkout/components/prepurchase-notices';
import CompositeCheckout from './composite-checkout/composite-checkout';
import { fetchStripeConfiguration } from './composite-checkout/payment-method-helpers';
import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/state/logstash/actions';
import Recaptcha from 'calypso/signup/recaptcha';
import getCartKey from './get-cart-key';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcom = wp.undocumented();

const emptyCart = getEmptyResponseCart();

const debug = debugFactory( 'calypso:checkout-system-decider' );

export default function CheckoutSystemDecider( {
	productAliasFromUrl,
	purchaseId,
	selectedFeature,
	couponCode,
	isComingFromUpsell,
	plan,
	selectedSite,
	redirectTo,
	isLoggedOutCart,
	isNoSiteCart,
	isJetpackCheckout,
} ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	const prepurchaseNotices = <PrePurchaseNotices />;

	useEffect( () => {
		if ( productAliasFromUrl ) {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message: 'CheckoutSystemDecider saw productSlug to add',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						productSlug: productAliasFromUrl,
					},
				} )
			);
		}
	}, [ reduxDispatch, productAliasFromUrl ] );

	const logCheckoutError = useCallback(
		( error ) => {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message: 'composite checkout load error',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						env: config( 'env_id' ),
						type: 'checkout_system_decider',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch ]
	);

	const cartKey = useMemo(
		() =>
			getCartKey( {
				selectedSite,
				isLoggedOutCart,
				isNoSiteCart,
			} ),
		[ selectedSite, isLoggedOutCart, isNoSiteCart ]
	);
	debug( 'cartKey is', cartKey );

	let siteSlug = selectedSite?.slug;

	if ( ! siteSlug ) {
		siteSlug = 'no-site';

		if ( isLoggedOutCart || isNoSiteCart ) {
			siteSlug = 'no-user';
		}
	}

	// If we do not have a site or user, we cannot fetch the initial cart from
	// the server, so we'll just mock it as an empty cart here.
	const getCart = isLoggedOutCart || isNoSiteCart ? () => Promise.resolve( emptyCart ) : undefined;

	return (
		<>
			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logCheckoutError }
			>
				<CalypsoShoppingCartProvider cartKey={ cartKey } getCart={ getCart }>
					<StripeHookProvider
						fetchStripeConfiguration={ fetchStripeConfigurationWpcom }
						locale={ locale }
					>
						<CompositeCheckout
							siteSlug={ siteSlug }
							siteId={ selectedSite?.ID }
							productAliasFromUrl={ productAliasFromUrl }
							purchaseId={ purchaseId }
							couponCode={ couponCode }
							redirectTo={ redirectTo }
							feature={ selectedFeature }
							plan={ plan }
							isComingFromUpsell={ isComingFromUpsell }
							infoMessage={ prepurchaseNotices }
							isLoggedOutCart={ isLoggedOutCart }
							isNoSiteCart={ isNoSiteCart }
							isJetpackCheckout={ isJetpackCheckout }
						/>
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			</CheckoutErrorBoundary>
			{ isLoggedOutCart && <Recaptcha badgePosition="bottomright" /> }
		</>
	);
}

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}
