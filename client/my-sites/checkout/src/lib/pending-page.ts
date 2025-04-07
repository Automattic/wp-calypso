import page from '@automattic/calypso-router';
import {
	SUCCESS,
	ERROR,
	FAILURE,
	PROCESSING,
	ASYNC_PENDING,
} from 'calypso/state/order-transactions/constants';
import type { OrderTransaction } from 'calypso/state/selectors/get-order-transaction';

export interface PendingPageRedirectOptions {
	siteSlug?: string | undefined;
	orderId?: string | number | undefined;
	receiptId?: string | number | undefined;
	urlType?: 'relative' | 'absolute';
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
}

export interface RedirectInstructions {
	url: string;
	isError?: boolean;
	isUnknown?: boolean;
}

export interface RedirectForTransactionStatusArgs {
	isLoadingOrder: boolean;
	error?: Error | null;
	transaction?: OrderTransaction | null;
	orderId?: number;
	receiptId?: number;
	redirectTo?: string;
	siteSlug?: string;
	saasRedirectUrl?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
}

/**
 * Redirect to a checkout pending page and from there to a (relative or absolute) url.
 *
 * The `url` parameter is the final destination. It will be appended to the
 * `redirect_to` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirect_to=/checkout/thank-you/:receiptId`
 *
 * The pending page will redirect to the final destination when the order is complete.
 *
 * If `siteSlug` is not provided, it will use `no-site`.
 *
 * If `receiptId` is provided, it means the transaction is already complete and
 * may cause the pending page to redirect immediately to the `url`.
 *
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 */
export function redirectThroughPending(
	url: string,
	options: Omit< PendingPageRedirectOptions, 'urlType' >
): void {
	if ( ! isRelativeUrl( url ) ) {
		return absoluteRedirectThroughPending( url, options );
	}
	try {
		relativeRedirectThroughPending( url, options );
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error(
			`relative redirect to "${ url }" failed. Falling back to absolute redirect. Error was:`,
			err
		);
		absoluteRedirectThroughPending( url, options );
	}
}

function isRelativeUrl( url: string ): boolean {
	return url.startsWith( '/' ) && ! url.startsWith( '//' );
}

/**
 * Redirect to a checkout pending page and from there to a relative url.
 *
 * The `url` parameter is the final destination. It will be appended to the
 * `redirect_to` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirect_to=/checkout/thank-you/:receiptId`
 *
 * The pending page will redirect to the final destination when the order is complete.
 *
 * If `siteSlug` is not provided, it will use `no-site`.
 *
 * If `receiptId` is provided, it means the transaction is already complete and
 * may cause the pending page to redirect immediately to the `url`.
 *
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 */
export function relativeRedirectThroughPending(
	url: string,
	options: Omit< PendingPageRedirectOptions, 'urlType' >
): void {
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}
	page(
		addUrlToPendingPageRedirect( url, {
			...options,
			urlType: 'relative',
		} )
	);
}

/**
 * Redirect to a checkout pending page and from there to an absolute url.
 *
 * The `url` parameter is the final destination. It will be appended to the
 * `redirect_to` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirect_to=/checkout/thank-you/:receiptId`
 *
 * The pending page will redirect to the final destination when the order is complete.
 *
 * If `siteSlug` is not provided, it will use `no-site`.
 *
 * If `receiptId` is provided, it means the transaction is already complete and
 * may cause the pending page to redirect immediately to the `url`.
 *
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 */
export function absoluteRedirectThroughPending(
	url: string,
	options: Omit< PendingPageRedirectOptions, 'urlType' >
): void {
	window.location.href = addUrlToPendingPageRedirect( url, {
		...options,
		urlType: 'absolute',
	} );
}

/**
 * Add a relative or absolute url to the checkout pending page url.
 *
 * The `url` parameter is the final destination. It will be appended to the
 * `redirect_to` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirect_to=/checkout/thank-you/:receiptId`
 *
 * The pending page will redirect to the final destination when the order is complete.
 *
 * If `siteSlug` is not provided, it will use `no-site`.
 *
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 *
 * If `receiptId` is provided, it means the transaction is already complete and
 * may cause the pending page to redirect immediately to the `url`.
 *
 * You should always specify `urlType` as either 'absolute' or 'relative' but
 * it will default to 'absolute'.
 */
export function addUrlToPendingPageRedirect(
	url: string,
	options: PendingPageRedirectOptions
): string {
	const {
		siteSlug,
		orderId,
		urlType = 'absolute',
		receiptId = ':receiptId',
		fromSiteSlug,
	} = options;

	const { origin = 'https://wordpress.com' } = typeof window !== 'undefined' ? window.location : {};
	const successUrlPath =
		`/checkout/thank-you/${ siteSlug || 'no-site' }/pending/` +
		( orderId ? `${ orderId }` : ':orderId' );
	const successUrlBase = `${ origin }${ successUrlPath }`;
	const successUrlObject = new URL( successUrlBase );
	successUrlObject.searchParams.set( 'redirect_to', url );
	successUrlObject.searchParams.set( 'receiptId', String( receiptId ) );
	if ( fromSiteSlug ) {
		successUrlObject.searchParams.set( 'from_site_slug', fromSiteSlug );
	}
	if ( urlType === 'relative' ) {
		return successUrlObject.pathname + successUrlObject.search + successUrlObject.hash;
	}
	return successUrlObject.href;
}

/**
 * Replaces receipt ID placeholders in a URL with the receipt ID.
 *
 * There are currently two types of placeholders. The first and most common is
 * the explicit `:receiptId` string. However, prior to D83814-code, the server
 * would use the word `pending` as the placeholder (which was confusing because
 * there exists a calypso URL with the word `pending` followed by an order ID).
 * Just in case that pattern is still used, this function handles that
 * placeholder as well.
 */
function interpolateReceiptId( url: string, receiptId: number ): string {
	if ( url.includes( ':receiptId' ) ) {
		return url.replaceAll( ':receiptId', `${ receiptId }` );
	}

	// Only treat `/pending` as a placeholder if it's the end of the URL
	// pathname, but preserve query strings or hashes.
	const receiptPlaceholderRegexp = /\/pending([?#]|$)/;
	if ( receiptPlaceholderRegexp.test( url ) ) {
		return url.replace( receiptPlaceholderRegexp, `/${ receiptId }$1` );
	}

	return url;
}

/**
 * Return false for absolute URLs which are on unknown hosts.
 *
 * Because the `redirect_to` query param on the pending page is the target of
 * that page's redirect, we want to make sure we do not create an open redirect
 * security hole that could go anywhere. This function will disallow a URL
 * which is absolute and on an unknown host.
 */
function isRedirectAllowed( url: string, siteSlug: string | undefined ): boolean {
	if ( url.startsWith( '/' ) ) {
		return true;
	}

	const allowedHostsForRedirect = [
		'wordpress.com',
		'wpcalypso.wordpress.com',
		'horizon.wordpress.com',
		'calypso.localhost',
		'jetpack.cloud.localhost',
		'cloud.jetpack.com',
		'jetpack.com',
		'akismet.com',
		siteSlug,
	];

	try {
		const parsedUrl = new URL( url );
		const { hostname, pathname } = parsedUrl;
		if ( ! hostname ) {
			return false;
		}

		// For subdirectory site, check that both hostname and subdirectory matches
		// the siteSlug (host.name::subdirectory).
		if ( siteSlug?.includes( '::' ) ) {
			const [ hostnameFromSlug, ...subdirectoryParts ] = siteSlug.split( '::' );
			const subdirectoryPathFromSlug = subdirectoryParts.join( '/' );
			if (
				hostname !== hostnameFromSlug &&
				! pathname?.startsWith( `/${ subdirectoryPathFromSlug }` )
			) {
				return false;
			}
			return true;
		}

		// Return true for *.calypso.live urls.
		if ( /^([a-zA-Z0-9-]+\.)?calypso\.live$/.test( hostname ) ) {
			return true;
		}

		if ( ! allowedHostsForRedirect.includes( hostname ) ) {
			return false;
		}

		return true;
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error( `Redirecting to absolute url '${ url }' failed:`, err );
	}
	return false;
}

/**
 * Guard against redirecting to absolute URLs which are on unknown hosts.
 *
 * Because the `redirect_to` query param on the pending page is the target of
 * that page's redirect, we want to make sure we do not create an open redirect
 * security hole that could go anywhere. This function will disallow a URL
 * which is absolute and on an unknown host, returning the `fallbackUrl` instead.
 */
export function filterAllowedRedirect(
	url: string,
	siteSlug: string | undefined,
	fallbackUrl: string
): string {
	if ( isRedirectAllowed( url, siteSlug ) ) {
		return url;
	}
	return fallbackUrl;
}

function getDefaultSuccessUrl(
	siteSlug: string | undefined,
	receiptId: number | undefined
): string {
	return `/checkout/thank-you/${ siteSlug ?? 'no-site' }/${ receiptId ?? 'unknown-receipt' }`;
}

/**
 * Calculate a URL to visit after the post-checkout pending page.
 *
 * Designed to be run by the `CheckoutPending` component which is displayed
 * after checkout.
 *
 * Typically this will only return a result if the transaction exists and was
 * successful, but it will also return a result if there is an error, if there
 * is a receipt (meaning the transaction was already successful), or if there
 * is no receipt and no order (meaning we have to guess what to do).
 *
 * If a redirect is appropriate, the returned URL will usually be the
 * `redirect_to` option, but only if it is a relative URL or in a list of
 * allowed hosts to prevent having an open redirect. Otherwise it may be a
 * generic thank-you page.
 *
 * If the transaction is still pending, this will return `undefined` and no
 * redirect should be performed.
 *
 * The result may also include `isError` if there was an error during the
 * redirect or transaction, or `isUnknown` if the transaction had an unknown
 * response. These flags can be used to notify the user.
 */
export function getRedirectFromPendingPage( {
	isLoadingOrder,
	error,
	transaction,
	orderId,
	receiptId,
	redirectTo,
	siteSlug,
	saasRedirectUrl,
	fromSiteSlug,
}: RedirectForTransactionStatusArgs ): RedirectInstructions | undefined {
	const checkoutUrl = siteSlug ? `/checkout/${ siteSlug }` : '/checkout/no-site';
	const errorUrl = '/checkout/failed-purchases';

	// If SaaS Product Redirect URL was passed then just return as redirect instruction so that
	// we can redirect user immediately to vendor application.
	if ( saasRedirectUrl ) {
		return {
			url: saasRedirectUrl,
		};
	}

	// We can't make any other decisions until we've loaded the order because
	// we need that to know how to proceed.
	if ( isLoadingOrder ) {
		return undefined;
	}

	// If there is a receipt ID and the order is not loading and does not exist
	// (eg: for free purchases which do not use Orders), then the order must
	// already be complete. In that case, we can redirect immediately.
	if ( receiptId && ! isLoadingOrder && ! transaction ) {
		return {
			url: filterAllowedRedirect(
				interpolateReceiptId(
					redirectTo ?? getDefaultSuccessUrl( siteSlug, receiptId ),
					receiptId
				),
				siteSlug || fromSiteSlug,
				getDefaultSuccessUrl( siteSlug, receiptId )
			),
		};
	}

	// If the order ID is missing and there is no receiptId, we don't know
	// what to do because there's no way to know the status of the
	// transaction. If this happens it's definitely a bug, but let's keep the
	// existing behavior and send the user to a generic thank-you page,
	// assuming that the purchase was successful. This goes to the URL path
	// `/checkout/thank-you/:site/:receiptId` but without a real receiptId.
	if ( ! orderId && ! transaction && ! receiptId ) {
		return {
			url: getDefaultSuccessUrl( siteSlug, undefined ),
		};
	}

	if ( transaction?.processingStatus === SUCCESS ) {
		// If the order is complete, we can redirect to the final page.
		const { receiptId: transactionReceiptId } = transaction;

		return {
			url: filterAllowedRedirect(
				interpolateReceiptId(
					redirectTo ?? getDefaultSuccessUrl( siteSlug, transactionReceiptId ),
					transactionReceiptId
				),
				siteSlug || fromSiteSlug,
				getDefaultSuccessUrl( siteSlug, transactionReceiptId )
			),
		};
	}

	// If the processing status indicates that there was something wrong,
	// it could be because the user has cancelled the payment, or because
	// the payment failed after being authorized. Redirect users back to
	// the checkout page so they can try again on a failure or to a
	// dedicated error page on an error.
	if ( transaction?.processingStatus === ERROR ) {
		return {
			url: errorUrl,
			isError: true,
		};
	}
	if ( transaction?.processingStatus === FAILURE ) {
		return {
			url: checkoutUrl,
			isError: true,
		};
	}

	if (
		transaction?.processingStatus === PROCESSING ||
		transaction?.processingStatus === ASYNC_PENDING
	) {
		return undefined;
	}

	// A HTTP or other unknown error occured; we will send the user back to
	// checkout.
	if ( error ) {
		return {
			url: checkoutUrl,
			isError: true,
		};
	}

	return {
		url: checkoutUrl,
		isUnknown: true,
	};
}
