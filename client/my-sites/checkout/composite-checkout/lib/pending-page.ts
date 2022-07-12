import page from 'page';

export interface PendingPageRedirectOptions {
	siteSlug?: string | undefined;
	orderId?: string | number | undefined;
	receiptId?: string | number | undefined;
	urlType?: 'relative' | 'absolute';
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
