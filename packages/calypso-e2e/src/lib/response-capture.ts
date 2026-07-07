import { Page, Route, Request as PlaywrightRequest } from 'playwright';

interface ArmedCapture {
	/**
	 * Resolves with the matched response's body text, captured immune to a page
	 * navigation that would otherwise evict it. Rejects if no matching response
	 * arrives within the timeout.
	 */
	body: Promise< string >;
	/** Removes the route and clears the timeout. Safe to call more than once. */
	dispose: () => Promise< void >;
}

/**
 * Arms interception for the first request satisfying `isTarget` and returns a
 * promise for its response body text.
 *
 * Playwright reads response bodies lazily over CDP (`Network.getResponseBody`).
 * When the page navigates right after a request — publish redirecting to the
 * launchpad, WooCommerce signup redirecting to woocommerce.com — a later
 * `response.json()` races the navigation, which evicts the network resource and
 * throws "No resource with given identifier found". `route.fetch()` returns an
 * APIResponse buffered in the driver process, not the page, so reading its body
 * is immune to that eviction.
 *
 * Arm this before the action that triggers the request, run the action, then
 * await `body`. Always `dispose()` afterwards to remove the route.
 *
 * @param page       The page to intercept on.
 * @param urlPattern Route pattern; keep it narrow so unrelated requests are not
 *                   intercepted. Non-matching-method requests to the same URL
 *                   are passed through untouched.
 * @param isTarget   Predicate selecting the exact request to capture.
 * @param options         Optional settings.
 * @param options.timeout Milliseconds to wait for a matching response (default 30s).
 */
export async function armResponseCapture(
	page: Page,
	urlPattern: RegExp,
	isTarget: ( request: PlaywrightRequest ) => boolean,
	options: { timeout?: number } = {}
): Promise< ArmedCapture > {
	const timeout = options.timeout ?? 30_000;

	let settle!: ( text: string ) => void;
	let fail!: ( error: Error ) => void;
	const body = new Promise< string >( ( resolve, reject ) => {
		settle = resolve;
		fail = reject;
	} );

	let matched = false;
	const handler = async ( route: Route ) => {
		if ( matched || ! isTarget( route.request() ) ) {
			await route.continue();
			return;
		}
		matched = true;
		try {
			const apiResponse = await route.fetch();
			const text = await apiResponse.text();
			// Fulfill from the decoded text, dropping the encoding/length headers so
			// the browser does not try to gunzip an already-decoded body.
			const headers = { ...apiResponse.headers() };
			delete headers[ 'content-encoding' ];
			delete headers[ 'content-length' ];
			await route.fulfill( { status: apiResponse.status(), headers, body: text } );
			settle( text );
		} catch ( error ) {
			fail( error as Error );
			await route.continue().catch( () => undefined );
		}
	};

	await page.route( urlPattern, handler );

	const timer = setTimeout(
		() => fail( new Error( `armResponseCapture: no matching response within ${ timeout }ms` ) ),
		timeout
	);

	let disposed = false;
	const dispose = async (): Promise< void > => {
		if ( disposed ) {
			return;
		}
		disposed = true;
		clearTimeout( timer );
		await page.unroute( urlPattern, handler ).catch( () => undefined );
	};

	return { body, dispose };
}
