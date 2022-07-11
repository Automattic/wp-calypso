import page from 'page';

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
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 */
export function redirectThroughPending(
	url: string,
	siteSlug: string | undefined,
	orderId: string | number | undefined
): void {
	if ( ! isRelativeUrl( url ) ) {
		return absoluteRedirectThroughPending( url, siteSlug, orderId );
	}
	try {
		relativeRedirectThroughPending( url, siteSlug, orderId );
	} catch ( err ) {
		absoluteRedirectThroughPending( url, siteSlug, orderId );
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
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 */
export function relativeRedirectThroughPending(
	url: string,
	siteSlug: string | undefined,
	orderId: string | number | undefined
): void {
	window.scrollTo( 0, 0 );
	page( addUrlToPendingPageRedirect( url, siteSlug, orderId, 'relative' ) );
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
 * An order ID is required for the pending page to operate. If `orderId` is not
 * provided, it will use the placeholder `:orderId` but please note that this
 * must be replaced somewhere (typically in an endpoint) before the
 * resulting URL will be valid!
 */
export function absoluteRedirectThroughPending(
	url: string,
	siteSlug: string | undefined,
	orderId: string | number | undefined
): void {
	window.location.href = addUrlToPendingPageRedirect( url, siteSlug, orderId, 'absolute' );
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
 */
export function addUrlToPendingPageRedirect(
	url: string,
	siteSlug: string | undefined,
	orderId: string | number | undefined,
	urlType: 'relative' | 'absolute'
): string {
	const { origin = 'https://wordpress.com' } = typeof window !== 'undefined' ? window.location : {};
	const successUrlPath =
		`/checkout/thank-you/${ siteSlug || 'no-site' }/pending/` +
		( orderId ? `${ orderId }` : ':orderId' );
	const successUrlBase = `${ origin }${ successUrlPath }`;
	const successUrlObject = new URL( successUrlBase );
	successUrlObject.searchParams.set( 'redirectTo', url );
	if ( urlType === 'relative' ) {
		return successUrlObject.pathname + successUrlObject.search + successUrlObject.hash;
	}
	return successUrlObject.href;
}
