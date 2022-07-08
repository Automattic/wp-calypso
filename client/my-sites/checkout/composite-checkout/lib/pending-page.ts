import page from 'page';

/**
 * Redirect to a checkout pending page and from there to a (relative or absolute) url.
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
