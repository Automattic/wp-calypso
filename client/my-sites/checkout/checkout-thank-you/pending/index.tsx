import {
	receiptQuery,
	siteAutomatedTransferStatusQuery,
	sitePluginsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { Step } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import { invokeSurvicateEvent } from '@automattic/survicate';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { useCheckoutHelpCenter } from 'calypso/my-sites/checkout/src/hooks/use-checkout-help-center';
import { getRedirectFromPendingPage } from 'calypso/my-sites/checkout/src/lib/pending-page';
import { sendMessageToOpener } from 'calypso/my-sites/checkout/src/lib/popup';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector, useDispatch } from 'calypso/state';
import { receiveAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { SUCCESS } from 'calypso/state/order-transactions/constants';
import { storePersistedStateItem } from 'calypso/state/persisted-state';
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import usePurchaseOrder from '../../src/hooks/use-purchase-order';
import { logStashLoadErrorEvent } from '../../src/lib/analytics';
import type { RedirectInstructions } from 'calypso/my-sites/checkout/src/lib/pending-page';
import type {
	OrderTransaction,
	OrderTransactionSuccess,
} from 'calypso/state/selectors/get-order-transaction';
import type { CalypsoDispatch } from 'calypso/state/types';

import './style.scss';

interface CheckoutPendingProps {
	orderId: number | ':orderId';
	receiptId: number | undefined;
	siteSlug?: string;
	redirectTo?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */

const MIN_PENDING_HOLD_MS = 3000;
const MAX_ATOMIC_TRANSFER_WAIT_MS = 90_000;
const MAX_PLUGIN_INSTALL_WAIT_MS = 60_000;
const ATOMIC_TRANSFER_POLL_INTERVAL_MS = 2000;

function PendingPageHelpLink() {
	const { helpCenterButtonLink, toggleHelpCenter } = useCheckoutHelpCenter();
	return <Step.LinkButton onClick={ toggleHelpCenter }>{ helpCenterButtonLink }</Step.LinkButton>;
}

/**
 * A page that polls the orders endpoint for a processing transaction and
 * redirects when done.
 *
 * There are two possible URLs that will render this page:
 *
 * - `/checkout/thank-you/:site/pending/:orderId`
 * - `/checkout/thank-you/no-site/pending/:orderId`
 *
 * The `orderId` prop comes from the last part of the URL and the `siteSlug`
 * prop comes from the `:site` part of the URL and will be empty if there is no
 * site. In some cases (eg: free purchases which do not generate an order),
 * this could be the placeholder `:orderId`. If that happens and there is a
 * `receiptId` prop, the success redirect will still occur, but if it happens
 * when there is no `receiptId`, we cannot know what to do and the user will be
 * redirected to a generic thank-you page.
 *
 * The `redirectTo` prop comes from the `redirect_to` query string parameter.
 * It may include a literal `/pending` as part of the URL; if that's the
 * case, that string will be replaced by the receipt ID when the transaction
 * completes.
 *
 * The `receiptId` prop comes from the query string parameter of the same name.
 * It must be numeric. If set, we know that the transaction is complete and
 * will skip polling for the order.
 */
function CheckoutPending( {
	orderId: orderIdOrPlaceholder,
	receiptId,
	siteSlug,
	redirectTo,
	fromSiteSlug,
}: CheckoutPendingProps ) {
	const orderId = isValidOrderId( orderIdOrPlaceholder ) ? orderIdOrPlaceholder : undefined;

	const translate = useTranslate();

	const { isAtomicTransferExpected } = useRedirectOnTransactionSuccess( {
		orderId,
		receiptId,
		siteSlug,
		redirectTo,
		fromSiteSlug,
	} );
	const loadingPhrase = useAtomicTransferLoadingPhrase( isAtomicTransferExpected );

	const content = (
		<Step.Loading
			topBarRightElement={ <PendingPageHelpLink /> }
			title={ loadingPhrase }
			subtitle={
				isAtomicTransferExpected
					? translate( 'This can take a moment. Please keep this tab open.' )
					: undefined
			}
		/>
	);

	return (
		<>
			<PageViewTracker
				path={
					siteSlug
						? '/checkout/thank-you/:site/pending/:order_id'
						: '/checkout/thank-you/no-site/pending/:order_id'
				}
				title="Checkout Pending"
				properties={ { order_id: orderId, ...( siteSlug && { site: siteSlug } ) } }
			/>
			{ content }
		</>
	);
}

function isValidOrderId( orderId: number | ':orderId' ): orderId is number {
	return Number.isInteger( orderId );
}

function useAtomicTransferLoadingPhrase( enabled: boolean ): string | undefined {
	const translate = useTranslate();
	const [ phraseIndex, setPhraseIndex ] = useState( -1 );

	const phrases = useMemo(
		() => [
			{ text: translate( 'Preparing your site' ), duration: 4_000 },
			{ text: translate( 'Building your workspace' ), duration: 6_000 },
			{ text: translate( 'Setting up your tools' ), duration: 4_000 },
			{ text: translate( 'Adding new capabilities' ), duration: 6_000 },
			{ text: translate( 'Connecting the pieces' ), duration: 4_000 },
			{ text: translate( 'Configuring your features' ), duration: 6_000 },
			{ text: translate( 'Activating new features' ), duration: 4_000 },
			{ text: translate( 'Running final checks' ), duration: 6_000 },
			{ text: translate( "Making sure everything's ready" ), duration: 6_000 },
			{ text: translate( 'Almost ready' ), duration: 0 },
		],
		[ translate ]
	);

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}
		let cumulative = 1_000; // first phrase appears at T+1s
		const timeouts = phrases.map( ( _, index ) => {
			const id = window.setTimeout( () => setPhraseIndex( index ), cumulative );
			cumulative += phrases[ index ].duration;
			return id;
		} );
		return () => timeouts.forEach( window.clearTimeout );
	}, [ enabled, phrases ] );

	if ( phraseIndex < 0 ) {
		return undefined;
	}
	return phrases[ phraseIndex ].text;
}

function performRedirect( url: string ): void {
	// Stepper (/setup/) and signup (/start/site-content-collection) routes require a
	// hard redirect because they are self-contained apps that need a fresh Calypso
	// bundle. A client-side page() call would land in the wrong bundle and break the
	// flow (see https://github.com/Automattic/wp-calypso/pull/68538).
	if (
		url.startsWith( '/' ) &&
		! url.startsWith( '/setup/' ) &&
		! url.includes( '/start/site-content-collection' )
	) {
		page( url );
		return;
	}
	window.location.href = url;
}

// If the current page is in the pop-up, notify to the opener and delay the redirection.
// Otherwise, do the redirection immediately.
function notifyAndPerformRedirect(
	siteSlug: string | undefined,
	{ isError, isUnknown, url }: RedirectInstructions
): void {
	if (
		siteSlug &&
		sendMessageToOpener( siteSlug, isError || isUnknown ? 'checkoutFailed' : 'checkoutCompleted' )
	) {
		window.setTimeout( () => performRedirect( url ), 3000 );
		return;
	}

	performRedirect( url );
}

function useRedirectOnTransactionSuccess( {
	orderId,
	receiptId,
	siteSlug,
	redirectTo,
	fromSiteSlug,
}: {
	orderId: number | undefined;
	receiptId: number | undefined;
	siteSlug?: string;
	redirectTo?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
} ): { isAtomicTransferExpected: boolean } {
	const translate = useTranslate();

	const { isLoading: isLoadingOrder, order: transaction } = usePurchaseOrder( orderId, 5000 );

	const transactionReceiptId = isTransactionSuccessful( transaction )
		? transaction.receiptId
		: undefined;
	const finalReceiptId = receiptId ?? transactionReceiptId;
	const {
		data: receipt,
		isSuccess: isReceiptSuccess,
		isError: isReceiptError,
	} = useQuery( {
		...receiptQuery( finalReceiptId ?? 0 ),
		enabled: !! finalReceiptId,
	} );
	const isReceiptLoaded = isReceiptSuccess || isReceiptError;

	// Best-effort: capture marketplace plugin slugs from the receipt. The receipt
	// is the authoritative source — the cart may be empty for redirect payment
	// methods (e.g. PayPal) by the time the pending page loads.
	const marketplacePluginSlugs = useMemo(
		() =>
			( receipt?.items ?? [] )
				.filter(
					( item ) =>
						item.marketplace_product_type === 'marketplace_plugin' ||
						item.marketplace_product_type === 'saas_plugin'
				)
				.map( ( item ) => item.marketplace_product_slug )
				.filter( ( slug ): slug is string => !! slug ),
		[ receipt ]
	);
	const isMarketplacePluginPurchase = marketplacePluginSlugs.length > 0;

	const marketplaceThemeSlugs = useMemo(
		() =>
			( receipt?.items ?? [] )
				.filter( ( item ) => item.marketplace_product_type === 'marketplace_theme' )
				.map( ( item ) => item.marketplace_product_slug )
				.filter( ( slug ): slug is string => !! slug ),
		[ receipt ]
	);
	const isMarketplaceThemePurchase = marketplaceThemeSlugs.length > 0;

	// For theme+plugin bundles, marketplace-thank-you handles activation polling — don't
	// also wait on the pending page or users get double-waits and the wrong destination.
	const shouldWaitForPluginInstall = isMarketplacePluginPurchase && ! isMarketplaceThemePurchase;

	const error: Error | null = useSelector( ( state ) =>
		orderId ? getOrderTransactionError( state, orderId ) : null
	);
	const reduxDispatch = useDispatch();
	const currentUserId = useSelector( getCurrentUserId );
	const cartKey = useCartKey();
	const { reloadFromServer: reloadCart } = useShoppingCart( cartKey );

	const firstItem = receipt?.items[ 0 ];
	const isRenewal = receipt?.items.some( ( item ) => item.type === 'recurring' ) ?? false;
	const productName = firstItem?.variation || firstItem?.product || '';
	const blogId = firstItem?.site_id;
	const freshSiteSlug = useSelector( ( state ) =>
		blogId ? getSiteSlug( state, blogId ) : null
	);
	const siteAdminPluginsUrl = useSelector( ( state ) =>
		blogId
			? getSiteAdminUrl( state, blogId, 'plugins.php?activate=true&plugin_status=active' )
			: null
	);
	const saasRedirectUrl = receipt?.items.reduce< string | undefined >(
		( url, item ) => url ?? ( item.saas_redirect_url || undefined ),
		undefined
	);
	const resolvedPurchaseId =
		receipt?.items.find( ( item ) => item.store_subscription_id )?.store_subscription_id ??
		undefined;

	const { searchParams } = getUrlParts( redirectTo || '/' );
	// Prefer checkout_type from the receipt (more reliable) and fall back to
	// the query string for receipts fetched before the field was available.
	const isUnifiedCheckout =
		( receipt?.checkout_type ?? searchParams.get( 'checkout_type' ) ) === 'unified';

	// For unified checkout (logged-out flow where a new account + site are
	// created before the transaction), we re-fetch the current user once the
	// receipt is available. By the time the pending page has finished polling
	// for the transaction, enough time has passed for the server to propagate
	// the new site, so a fresh fetch reliably returns site_count >= 1. Without
	// this, siteSelection receives a stale site_count = 0 and renders "You
	// don't have any sites yet" instead of the thank-you page.
	const didRefreshUserForUnified = useRef( false );
	const [ isUserRefreshedForUnified, setIsUserRefreshedForUnified ] = useState( false );
	useEffect( () => {
		if ( ! isUnifiedCheckout || ! blogId || didRefreshUserForUnified.current ) {
			return;
		}
		didRefreshUserForUnified.current = true;
		( reduxDispatch( fetchCurrentUser() ) as Promise< unknown > )
			.catch( () => {} )
			.finally( () => setIsUserRefreshedForUnified( true ) );
	}, [ isUnifiedCheckout, blogId, reduxDispatch ] );

	const [ atomicWaitTimedOut, setAtomicWaitTimedOut ] = useState( false );
	// Always poll when blogId is known — the status is the authoritative signal for
	// whether an atomic transfer is in progress. The cart is not used here because
	// it may be empty by the time this page loads (e.g. PayPal / redirect flows).
	const { data: transferStatusData, isFetched: isTransferStatusFetched } = useQuery( {
		...siteAutomatedTransferStatusQuery( blogId ?? 0 ),
		enabled: !! blogId && ! atomicWaitTimedOut,
		refetchInterval: ( query ) => {
			const status = query.state.data?.status;
			if ( status === transferStates.COMPLETE ) {
				return false;
			}
			// No transfer in progress — stop polling so the redirect can proceed.
			if ( ! status || status === transferStates.NONE || status === transferStates.REVERTED ) {
				return false;
			}
			return ATOMIC_TRANSFER_POLL_INTERVAL_MS;
		},
	} );
	const transferStatus = transferStatusData?.status ?? null;
	// Derive atomic transfer expectation from the live status (not the cart).
	const isAtomicTransferExpected =
		!! blogId &&
		!! transferStatus &&
		transferStatus !== transferStates.NONE &&
		transferStatus !== transferStates.REVERTED;
	const isFinalSiteAtomic = useSelector( ( state ) =>
		blogId ? isSiteWpcomAtomic( state, blogId ) : false
	);

	const [ pluginInstallTimedOut, setPluginInstallTimedOut ] = useState( false );
	const { data: sitePluginsData } = useQuery( {
		...sitePluginsQuery( blogId ?? 0 ),
		enabled:
			!! blogId && shouldWaitForPluginInstall && isFinalSiteAtomic && ! pluginInstallTimedOut,
		refetchInterval: ( query ) => {
			const plugins = query.state.data?.plugins;
			if ( ! plugins ) {
				return ATOMIC_TRANSFER_POLL_INTERVAL_MS;
			}
			const allInstalledAndActive = marketplacePluginSlugs.every( ( slug ) =>
				plugins.some( ( plugin ) => plugin.slug === slug && plugin.active )
			);
			return allInstalledAndActive ? false : ATOMIC_TRANSFER_POLL_INTERVAL_MS;
		},
	} );
	const isPluginInstalled =
		! shouldWaitForPluginInstall ||
		pluginInstallTimedOut ||
		marketplacePluginSlugs.every( ( slug ) =>
			( sitePluginsData?.plugins ?? [] ).some( ( plugin ) => plugin.slug === slug && plugin.active )
		);

	const isAtomicTransferComplete =
		! isAtomicTransferExpected || isFinalSiteAtomic || atomicWaitTimedOut;

	// Once the transfer reports COMPLETE, re-fetch the site so `is_wpcom_atomic`
	// flips. `useAtomicTransfer` does the same dance — site endpoint lags transfer
	// status. Stop once either signal confirms atomic.
	useEffect( () => {
		if (
			! blogId ||
			! isAtomicTransferExpected ||
			isFinalSiteAtomic ||
			transferStatus !== transferStates.COMPLETE
		) {
			return;
		}
		const intervalId = window.setInterval( () => {
			reduxDispatch( requestSite( blogId ) );
		}, ATOMIC_TRANSFER_POLL_INTERVAL_MS );
		// Fire once immediately too.
		reduxDispatch( requestSite( blogId ) );
		return () => window.clearInterval( intervalId );
	}, [ blogId, isAtomicTransferExpected, isFinalSiteAtomic, transferStatus, reduxDispatch ] );

	// Watchdog. If we haven't seen completion within MAX_ATOMIC_TRANSFER_WAIT_MS,
	// give up and let the redirect proceed — better to drop the user at a
	// possibly-not-yet-ready page than to keep them stuck on the loader forever.
	useEffect( () => {
		if ( ! isAtomicTransferExpected || isAtomicTransferComplete ) {
			return;
		}
		const timeoutId = window.setTimeout( () => {
			setAtomicWaitTimedOut( true );
		}, MAX_ATOMIC_TRANSFER_WAIT_MS );
		return () => window.clearTimeout( timeoutId );
	}, [ isAtomicTransferExpected, isAtomicTransferComplete ] );

	// Plugin install watchdog. Start counting only once the site is Atomic.
	// If the plugin isn't active within MAX_PLUGIN_INSTALL_WAIT_MS, give up
	// and redirect anyway so the user isn't stuck on the loader forever.
	useEffect( () => {
		if ( ! shouldWaitForPluginInstall || ! isFinalSiteAtomic || isPluginInstalled ) {
			return;
		}
		const timeoutId = window.setTimeout( () => {
			setPluginInstallTimedOut( true );
		}, MAX_PLUGIN_INSTALL_WAIT_MS );
		return () => window.clearTimeout( timeoutId );
	}, [ shouldWaitForPluginInstall, isFinalSiteAtomic, isPluginInstalled ] );

	// Redirect and display notices.
	const [ mountTime ] = useState( () => Date.now() );
	const didRedirect = useRef( false );
	useEffect( () => {
		if ( didRedirect.current ) {
			return;
		}

		// Make sure the cart is always fresh if anything changes. This way, once
		// the order completes and the server empties the cart, the front-end will
		// get an updated cached cart and future pages will show the cart correctly
		// as empty.
		reloadCart().catch( () => {
			// No need to do anything here. CartMessages will report this error to the user.
		} );

		// When blogId is known, wait for the first transfer status result before
		// deciding whether to hold for an atomic transfer. Without this, the
		// redirect might fire before we detect an in-progress transfer.
		if ( blogId && ! isTransferStatusFetched ) {
			return;
		}

		// Wait for the receipt to load before redirecting so we can display the
		// correct notification and possibly run analytics.
		if ( finalReceiptId && ! isReceiptLoaded ) {
			return;
		}

		// For purchases that trigger an Atomic transfer (e.g. plugin/theme on a
		// simple site), hold the redirect until the site is actually atomic — or
		// until the watchdog times out. Without this, users land at destination
		// pages that can't function on a non-atomic site.
		if ( ! isAtomicTransferComplete ) {
			return;
		}

		// Wait for the plugin to be installed and active before redirecting.
		// Without this the destination page would render before the install
		// completes, showing a confusing "not installed" state for a moment.
		if ( ! isPluginInstalled ) {
			return;
		}

		// For siteless purchases where the new site's ID was unknown at the time the
		// redirect URL was generated (e.g. redirect payment methods like PayPal that
		// build the thank-you URL before the transaction begins), resolve the site using
		// the blogId from the receipt. Two cases are handled:
		//
		// 1. redirectTo is '/' or empty: construct the full thank-you URL from blogId
		//    and receiptId, preserving any query params (e.g. ?checkout_type=unified).
		// 2. redirectTo contains a ':siteId' placeholder: replace it with the real blogId.
		//    This covers the onboarding cookie URL and ecommerce plan thank-you URL paths.
		const { pathname, search } = redirectTo
			? getUrlParts( redirectTo )
			: { pathname: undefined, search: '' };
		const effectiveRedirectTo = ( () => {
			if ( ( ! redirectTo || pathname === '/' ) && blogId && finalReceiptId ) {
				return `/checkout/thank-you/${ blogId }/${ finalReceiptId }${ search }`;
			}
			if ( blogId && redirectTo?.includes( ':siteId' ) ) {
				return redirectTo.replaceAll( ':siteId', String( blogId ) );
			}
			return redirectTo;
		} )();

		// For purchases that triggered an Atomic transfer, the redirect URL
		// was generated before the transfer and contains the pre-Atomic site
		// slug (e.g. example.wordpress.com instead of example.wpcomstaging.com).
		// Fix the destination and slug based on what was purchased.
		const postAtomicRedirectTo = ( () => {
			if ( ! isAtomicTransferExpected || ! freshSiteSlug ) {
				return effectiveRedirectTo;
			}
			if ( marketplaceThemeSlugs.length ) {
				// Theme purchases (with or without companion plugins) need the
				// marketplace-thank-you page to handle theme activation polling and
				// display. Skipping it would leave the theme inactive — and for
				// theme+plugin bundles, going straight to wp-admin/plugins.php
				// would hide theme activation from the user entirely.
				return addQueryArgs(
					{
						themes: marketplaceThemeSlugs.join( ',' ),
						...( marketplacePluginSlugs.length && {
							plugins: marketplacePluginSlugs.join( ',' ),
						} ),
					},
					`/marketplace/thank-you/${ freshSiteSlug }`
				);
			}
			if ( marketplacePluginSlugs.length && siteAdminPluginsUrl ) {
				// Plugin-only path: the pending page already waited for atomic transfer
				// AND plugin install completion. Hard-redirect to wp-admin's
				// installed-plugins screen, mirroring core WordPress behaviour after
				// a plugin activation.
				return siteAdminPluginsUrl;
			}
			// No marketplace plugin or theme in the receipt — fix the stale site slug
			// in the existing redirect URL so at least the destination resolves.
			if ( siteSlug && effectiveRedirectTo?.includes( siteSlug ) ) {
				return effectiveRedirectTo.replace( siteSlug, freshSiteSlug );
			}
			return effectiveRedirectTo;
		} )();

		const redirectInstructions = getRedirectFromPendingPage( {
			isLoadingOrder,
			error,
			transaction,
			orderId,
			receiptId,
			redirectTo: postAtomicRedirectTo,
			siteSlug: freshSiteSlug || siteSlug,
			saasRedirectUrl,
			fromSiteSlug,
			purchaseId: resolvedPurchaseId,
		} );

		if ( ! redirectInstructions ) {
			return;
		}

		// For unified checkout, wait for the current user to be re-fetched
		// (triggered by the useEffect above) before proceeding. This ensures
		// site_count is up-to-date in Redux so siteSelection doesn't incorrectly
		// bail with "You don't have any sites yet" on the thank-you page.
		if ( isUnifiedCheckout && blogId && ! isUserRefreshedForUnified ) {
			return;
		}

		didRedirect.current = true;
		if ( ! redirectInstructions.isError && ! redirectInstructions.isUnknown ) {
			invokeSurvicateEvent( 'purchaseCompleted' );
		}
		triggerPostRedirectNotices( {
			redirectInstructions,
			isRenewal,
			productName,
			translate,
			reduxDispatch,
		} );

		// Pre-populate the Redux sites store with the newly-purchased site so
		// that the thank-you page can use it immediately on arrival.
		if ( blogId ) {
			reduxDispatch( requestSite( blogId ) );
		}

		// After an Atomic transfer, the admin menu has new items (installed
		// plugin entries). Clear the stale menu from both Redux and IndexedDB
		// so the destination page fetches a fresh one via QuerySiteAdminMenu.
		// We must await the IndexedDB write directly — the normal Redux
		// persistence subscriber is throttled at 5s and the write is
		// async/unawaited, so it never completes before the redirect fires.
		if ( blogId && isAtomicTransferExpected && currentUserId ) {
			reduxDispatch( receiveAdminMenu( blogId, [] ) );
			// Key format from client/state/initial-state.js:getPersistenceKey
			const storageKey = `redux-state-${ currentUserId }:adminMenu`;
			storePersistedStateItem( storageKey, {
				menus: { [ blogId ]: [] },
				_timestamp: Date.now(),
			} ).catch( () => {
				// Best-effort — if IDB write fails, the destination page will
				// still fetch a fresh menu; the sidebar will just flash briefly.
			} );
		}

		// Force a hard redirect for post-Atomic navigation. Client-side
		// page() keeps the stale Calypso instance; a full reload re-reads
		// IndexedDB (cleared above) and resolves the new site slug cleanly.
		const finalRedirectUrl =
			isAtomicTransferExpected && redirectInstructions.url.startsWith( '/' )
				? window.location.origin + redirectInstructions.url
				: redirectInstructions.url;

		const elapsed = Date.now() - mountTime;
		const holdRemaining = Math.max( 0, MIN_PENDING_HOLD_MS - elapsed );

		window.setTimeout( () => {
			notifyAndPerformRedirect( siteSlug, {
				...redirectInstructions,
				url: finalRedirectUrl,
			} );
		}, holdRemaining );
	}, [
		isLoadingOrder,
		mountTime,
		saasRedirectUrl,
		isUnifiedCheckout,
		isUserRefreshedForUnified,
		error,
		finalReceiptId,
		isReceiptLoaded,
		isTransferStatusFetched,
		isAtomicTransferComplete,
		isAtomicTransferExpected,
		isPluginInstalled,
		marketplacePluginSlugs,
		marketplaceThemeSlugs,
		siteAdminPluginsUrl,
		isRenewal,
		blogId,
		currentUserId,
		orderId,
		productName,
		receiptId,
		redirectTo,
		reduxDispatch,
		reloadCart,
		siteSlug,
		transaction,
		translate,
		fromSiteSlug,
		freshSiteSlug,
		resolvedPurchaseId,
	] );

	return { isAtomicTransferExpected };
}

function isTransactionSuccessful(
	transaction: OrderTransaction | null | undefined
): transaction is OrderTransactionSuccess {
	return transaction?.processingStatus === SUCCESS;
}

function triggerPostRedirectNotices( {
	redirectInstructions,
	isRenewal,
	productName,
	translate,
	reduxDispatch,
}: {
	redirectInstructions: RedirectInstructions;
	isRenewal: boolean;
	productName: string;
	translate: ReturnType< typeof useTranslate >;
	reduxDispatch: CalypsoDispatch;
} ): void {
	if ( redirectInstructions.isError ) {
		const defaultFailErrorNotice = translate(
			"Sorry, we couldn't process your payment. Please try again later."
		);
		reduxDispatch(
			errorNotice( defaultFailErrorNotice, {
				isPersistent: true,
			} )
		);
		return;
	}

	if ( redirectInstructions.isUnknown ) {
		const unknownNotice = translate( 'Oops! Something went wrong. Please try again later.' );
		reduxDispatch(
			errorNotice( unknownNotice, {
				isPersistent: true,
			} )
		);
		return;
	}

	if ( isRenewal ) {
		displayRenewalSuccessNotice( {
			productName,
			translate,
			reduxDispatch,
		} );
		return;
	}
}

function displayRenewalSuccessNotice( {
	productName,
	translate,
	reduxDispatch,
}: {
	productName: string;
	translate: ReturnType< typeof useTranslate >;
	reduxDispatch: CalypsoDispatch;
} ): void {
	// show renewal success notice
	reduxDispatch(
		successNotice(
			translate( 'Success! You renewed %(productName)s.', {
				args: {
					productName,
				},
			} ),
			{ displayOnNextPage: true }
		)
	);
}

const logCheckoutError = ( error: Error ) => {
	logStashLoadErrorEvent( 'checkout_pending', error );
};

export default function CheckoutPendingWrapper( props: CheckoutPendingProps ) {
	const translate = useTranslate();
	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
			onError={ logCheckoutError }
		>
			<CalypsoShoppingCartProvider>
				<CheckoutPending { ...props } />
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
