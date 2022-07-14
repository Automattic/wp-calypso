import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { SUCCESS, ERROR, FAILURE, UNKNOWN } from 'calypso/state/order-transactions/constants';
import type { OrderTransaction } from 'calypso/state/selectors/get-order-transaction';

export interface PendingPageRedirectOptions {
	siteSlug?: string | undefined;
	orderId?: string | number | undefined;
	receiptId?: string | number | undefined;
	urlType?: 'relative' | 'absolute';
}

export interface RedirectInstructions {
	url: string;
	errorNotice?: string;
}

export interface RedirectForTransactionStatusArgs {
	error?: Error | null;
	transaction?: OrderTransaction | null;
	orderId?: number;
	receiptId?: number;
	redirectTo?: string;
	siteSlug?: string;
	translate: ReturnType< typeof useTranslate >;
}

/**
 * Redirect to a checkout pending page and from there to a (relative or absolute) url.
 *
 * The `url` parameter is the final destination. It will be appended to the
 * `redirectTo` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirectTo=/checkout/thank-you/:receiptId`
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
 * `redirectTo` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirectTo=/checkout/thank-you/:receiptId`
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
 * `redirectTo` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirectTo=/checkout/thank-you/:receiptId`
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
 * `redirectTo` query param on a URL for the pending page. If `url` is
 * `/checkout/thank-you/:receiptId`, then this will look something like:
 * `/checkout/thank-you/example.com/pending/1234?redirectTo=/checkout/thank-you/:receiptId`
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
	const { siteSlug, orderId, urlType = 'absolute', receiptId = ':receiptId' } = options;

	const { origin = 'https://wordpress.com' } = typeof window !== 'undefined' ? window.location : {};
	const successUrlPath =
		`/checkout/thank-you/${ siteSlug || 'no-site' }/pending/` +
		( orderId ? `${ orderId }` : ':orderId' );
	const successUrlBase = `${ origin }${ successUrlPath }`;
	const successUrlObject = new URL( successUrlBase );
	successUrlObject.searchParams.set( 'redirectTo', url );
	successUrlObject.searchParams.set( 'receiptId', String( receiptId ) );
	if ( urlType === 'relative' ) {
		return successUrlObject.pathname + successUrlObject.search + successUrlObject.hash;
	}
	return successUrlObject.href;
}

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

export function getRedirectFromPendingPage( {
	error,
	transaction,
	orderId,
	receiptId,
	redirectTo,
	siteSlug,
	translate,
}: RedirectForTransactionStatusArgs ): RedirectInstructions | undefined {
	const defaultFailUrl = siteSlug ? `/checkout/${ siteSlug }` : '/';
	const defaultFailErrorNotice = translate(
		"Sorry, we couldn't process your payment. Please try again later."
	);
	const planRoute = siteSlug ? `/plans/my-plan/${ siteSlug }` : '/pricing';
	const defaultSuccessUrl =
		siteSlug && receiptId
			? `/checkout/thank-you/${ siteSlug }/${ receiptId }`
			: '/checkout/thank-you/no-site';

	// If there is a receipt ID, then the order must already be complete. In
	// that case, we can redirect immediately.
	if ( receiptId && redirectTo ) {
		return {
			url: interpolateReceiptId( redirectTo, receiptId ),
		};
	}
	if ( receiptId && ! redirectTo ) {
		return {
			url: interpolateReceiptId( defaultSuccessUrl, receiptId ),
		};
	}

	// If the order ID is missing and there is no receiptId, we don't know
	// what to do because there's no way to know the status of the
	// transaction. If this happens it's definitely a bug, but let's keep the
	// existing behavior and send the user to a generic thank-you page,
	// assuming that the purchase was successful. This goes to the URL path
	// `/checkout/thank-you/:site/:receiptId` but without a receiptId.
	if ( ! orderId ) {
		return {
			url: `/checkout/thank-you/${ siteSlug ?? 'no-site' }/unknown-receipt`,
		};
	}

	if ( transaction ) {
		const { processingStatus } = transaction;

		// If the order is complete, we can redirect to the final page.
		if ( SUCCESS === processingStatus ) {
			const { receiptId: transactionReceiptId } = transaction;

			return {
				url: interpolateReceiptId( redirectTo ?? defaultSuccessUrl, transactionReceiptId ),
			};
		}

		// If the processing status indicates that there was something wrong, it
		// could be because the user has cancelled the payment, or because the
		// payment failed after being authorized. Redirect users back to the
		// checkout page so they can try again.
		if ( ERROR === processingStatus || FAILURE === processingStatus ) {
			return {
				errorNotice: defaultFailErrorNotice,
				url: defaultFailUrl,
			};
		}

		// The API has responded a status string that we don't expect somehow.
		// Redirect users back to the plan page so that they won't be stuck here.
		if ( UNKNOWN === processingStatus ) {
			return {
				errorNotice: defaultFailErrorNotice,
				url: planRoute,
			};
		}
	}

	// A HTTP error occured; we will send the user back to checkout.
	if ( error ) {
		return {
			errorNotice: defaultFailErrorNotice,
			url: defaultFailUrl,
		};
	}

	return undefined;
}
