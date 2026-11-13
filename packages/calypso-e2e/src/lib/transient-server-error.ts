import type { Page, Response } from 'playwright';

// Upstream gateway statuses that indicate a transient infra failure rather than
// the app itself. 500 (Internal Server Error) and 501 are deliberately excluded:
// they usually mean the app crashed or a genuine bug, which we want to fail on
// fast rather than mask by retrying. Mirrors the phrases isServerErrorPage()
// matches (Bad Gateway / Service Unavailable / Gateway Timeout).
export const TRANSIENT_UPSTREAM_STATUSES = [ 502, 503, 504 ];

// Waits before each retry of a transient upstream failure. A Calypso deploy
// rollout serves a stock 502 for a few seconds, so an immediate retry lands on
// the same 502. The 35s of backoff leaves room in the 120s per-test budget for
// the attempts themselves.
export const TRANSIENT_RETRY_DELAYS = [ 5_000, 10_000, 20_000 ];

/**
 * Which server-error pages isServerErrorPage() matches.
 */
export enum ServerErrorMatch {
	// Only the transient upstream errors (502/503/504), e.g. nginx "502 Bad Gateway".
	TransientOnly = 'transient-only',
	// Also the 500 "Internal Server Error" app-crash page.
	AnyServerError = 'any-server-error',
}

/**
 * Detects whether the page is currently showing a server-error page.
 *
 * By default matches only the transient upstream errors, which the retry
 * machinery keys on. ServerErrorMatch.AnyServerError also matches the 500 page,
 * for callers that must not mask a genuine error page behind a reload.
 *
 * @param {Page} page The page to inspect.
 * @param {ServerErrorMatch} match Which server-error pages to match.
 * @returns {Promise<boolean>} True when a matching server-error page is detected.
 */
export async function isServerErrorPage(
	page: Page,
	match: ServerErrorMatch = ServerErrorMatch.TransientOnly
): Promise< boolean > {
	// The enum does not exist in the browser, so hand it a plain boolean.
	const transientOnly = match === ServerErrorMatch.TransientOnly;

	return page
		.evaluate( ( transientOnly ) => {
			const title = document.title || '';
			const heading = document.querySelector( 'h1' )?.textContent || '';
			const haystack = `${ title } ${ heading }`;
			// Match the upstream error phrases (e.g. nginx "502 Bad Gateway")
			// rather than a bare status number, which could appear incidentally
			// in legitimate page text.
			const transient = /Bad Gateway|Service (Temporarily )?Unavailable|Gateway Time-?out/i;
			if ( transientOnly ) {
				return transient.test( haystack );
			}
			return transient.test( haystack ) || /Internal Server Error/i.test( haystack );
		}, transientOnly )
		.catch( () => false );
}

/**
 * Navigates to a URL, retrying with backoff while it lands on a transient
 * upstream error (502/503/504). Once the retries run out this throws rather
 * than return the error page.
 *
 * @param {Page} page The page to navigate.
 * @param {string} url The URL to navigate to.
 * @param options Options for each `page.goto` attempt, e.g. its timeout.
 * @returns {Promise<Response | null>} The response of the last navigation.
 */
export async function gotoWithRetry(
	page: Page,
	url: string,
	options?: Parameters< Page[ 'goto' ] >[ 1 ]
): Promise< Response | null > {
	// A deploy rollout serves a stock 502 for a few seconds; back off and
	// navigate again rather than let the caller time out on a missing locator.
	const maxAttempts = TRANSIENT_RETRY_DELAYS.length + 1;
	for ( let attempt = 1; ; attempt++ ) {
		const response = await page.goto( url, options );
		if ( ! ( await isTransientFailure( page, response ) ) ) {
			return response;
		}

		const status = response?.status();
		if ( attempt >= maxAttempts ) {
			throw new Error(
				`${ url } still returned a transient server error (status ${ status }) after ${ maxAttempts } attempts.`
			);
		}

		const delay = TRANSIENT_RETRY_DELAYS[ attempt - 1 ];
		console.warn(
			`${ url } attempt ${ attempt }/${ maxAttempts } returned a transient server error (status ${ status }), retrying in ${ delay }ms.`
		);
		await page.waitForTimeout( delay );
	}
}

/**
 * Whether a navigation landed on a transient upstream error: a 502/503/504
 * status, or a gateway-error page served with another status.
 */
async function isTransientFailure( page: Page, response: Response | null ): Promise< boolean > {
	if ( response && TRANSIENT_UPSTREAM_STATUSES.includes( response.status() ) ) {
		return true;
	}

	return isServerErrorPage( page );
}
