/**
 * External dependencies
 */
import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import debugFactory from 'debug';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { ShoppingCartProvider } from '@automattic/shopping-cart';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import CheckoutContainer from './checkout/checkout-container';
import PrePurchaseNotices from './checkout/prepurchase-notices';
import CompositeCheckout from './composite-checkout/composite-checkout';
import { fetchStripeConfiguration } from './composite-checkout/payment-method-helpers';
import { StripeHookProvider } from 'calypso/lib/stripe';
import config from 'calypso/config';
import { logToLogstash } from 'calypso/state/logstash/actions';
import Recaptcha from 'calypso/signup/recaptcha';
import getCartKey from './get-cart-key';

const debug = debugFactory( 'calypso:checkout-system-decider' );

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcom = wp.undocumented();
const wpcomGetCart = ( ...args ) => wpcom.getCart( ...args );
const wpcomSetCart = ( ...args ) => wpcom.setCart( ...args );

// Decide if we should use CompositeCheckout or CheckoutContainer
export default function CheckoutSystemDecider( {
	productAliasFromUrl,
	purchaseId,
	selectedFeature,
	couponCode,
	isComingFromSignup,
	isComingFromGutenboarding,
	isGutenboardingCreate,
	isComingFromUpsell,
	plan,
	selectedSite,
	reduxStore,
	redirectTo,
	upgradeIntent,
	clearTransaction,
	isLoggedOutCart,
	isNoSiteCart,
	cart: otherCart,
} ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();

	const prepurchaseNotices = <PrePurchaseNotices />;

	const checkoutVariant = getCheckoutVariant();

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

	const waitForOtherCartUpdates =
		otherCart?.hasPendingServerUpdates || ! otherCart?.hasLoadedFromServer;
	const cartKey = useMemo(
		() =>
			getCartKey( {
				selectedSite,
				isLoggedOutCart,
				isNoSiteCart,
				waitForOtherCartUpdates,
			} ),
		[ waitForOtherCartUpdates, selectedSite, isLoggedOutCart, isNoSiteCart ]
	);
	debug( 'cartKey is', cartKey );

	if ( 'composite-checkout' === checkoutVariant ) {
		let siteSlug = selectedSite?.slug;

		if ( ! siteSlug ) {
			siteSlug = 'no-site';

			if ( isLoggedOutCart || isNoSiteCart ) {
				siteSlug = 'no-user';
			}
		}

		const getCart =
			isLoggedOutCart || isNoSiteCart ? () => Promise.resolve( otherCart ) : wpcomGetCart;
		debug( 'getCart being controlled by', { isLoggedOutCart, isNoSiteCart, otherCart } );

		return (
			<>
				<CheckoutErrorBoundary
					errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
					onError={ logCheckoutError }
				>
					<ShoppingCartProvider cartKey={ cartKey } getCart={ getCart } setCart={ wpcomSetCart }>
						<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
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
							/>
						</StripeHookProvider>
					</ShoppingCartProvider>
				</CheckoutErrorBoundary>
				{ isLoggedOutCart && <Recaptcha badgePosition="bottomright" /> }
			</>
		);
	}

	return (
		<CheckoutContainer
			product={ productAliasFromUrl }
			purchaseId={ purchaseId }
			selectedFeature={ selectedFeature }
			couponCode={ couponCode }
			isComingFromSignup={ isComingFromSignup }
			isComingFromGutenboarding={ isComingFromGutenboarding }
			isGutenboardingCreate={ isGutenboardingCreate }
			isComingFromUpsell={ isComingFromUpsell }
			plan={ plan }
			selectedSite={ selectedSite }
			reduxStore={ reduxStore }
			redirectTo={ redirectTo }
			upgradeIntent={ upgradeIntent }
			clearTransaction={ clearTransaction }
			infoMessage={ prepurchaseNotices }
		/>
	);
}

function getCheckoutVariant() {
	if ( config.isEnabled( 'old-checkout-force' ) ) {
		debug( 'shouldShowCompositeCheckout false because old-checkout-force flag is set' );
		return 'old-checkout';
	}

	debug( 'shouldShowCompositeCheckout true' );
	return 'composite-checkout';
}

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}
