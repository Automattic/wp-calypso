import { Page, Request } from 'playwright';

// About twice the slowest event latency seen on CI (~15s after navigation starts).
// See https://github.com/Automattic/wp-calypso/pull/117178
const EVENT_TIMEOUT_MS = 30 * 1000;

// Modify global Window interface to include _tkAllowE2ETests
declare global {
	interface Window {
		_tkAllowE2ETests: boolean;
	}
}

/**
 * A class to help monitor Tracks events in the browser
 */
export class TracksEventManager {
	private page: Page;
	private eventTimeout: number;

	/**
	 * Construct an instance of the Tracks event manager class
	 * @param page
	 * @param eventTimeout How long to wait for a Tracks event to fire.
	 */
	constructor( page: Page, eventTimeout: number = EVENT_TIMEOUT_MS ) {
		this.page = page;
		this.eventTimeout = eventTimeout;
	}

	/**
	 * Initialize the Tracks event manager
	 *
	 * Must be awaited before navigating: until the init script has landed,
	 * `_tkAllowE2ETests` is unset and w.js drops every Tracks pixel because the
	 * e2e user agent matches its bot filter.
	 */
	async init() {
		await this.maybeInterceptRequest();
		await this.allowTestsToFireEvents();
	}

	/**
	 * Tell Tracks to allow these tests to fire events
	 * We later abort any requests to t.gif
	 */
	async allowTestsToFireEvents() {
		await this.page.addInitScript( () => {
			window._tkAllowE2ETests = true;
		} );
	}

	/**
	 * Navigate to a URL
	 *
	 * Doesn't wait for `load`: wait for a Tracks event to know the page is ready.
	 * @param url
	 */
	async navigateToUrl( url: string ) {
		await this.page.goto( url, { waitUntil: 'domcontentloaded' } );
	}

	/**
	 * Check if a Tracks event fired
	 * @param eventName
	 * @returns {Promise<boolean>}
	 */
	async didEventFire( eventName: string ): Promise< boolean > {
		return !! ( await this.getRequestUrlForEvent( eventName ) );
	}

	/**
	 * Get the request URL of a Tracks event
	 * @param eventName
	 * @returns {Promise<string>}
	 */
	async getRequestUrlForEvent( eventName: string ): Promise< string > {
		const pixelUrl: string = 'https://pixel.wp.com/t.gif';
		const request = await this.page.waitForRequest(
			( request: Request ) => {
				return (
					request.url().startsWith( pixelUrl ) &&
					this.getParamFromUrl( '_en', request.url() ) === eventName
				);
			},
			{ timeout: this.eventTimeout }
		);

		return request.url();
	}

	/**
	 * Get a parameter value from a URL
	 * @param param
	 * @param url
	 * @returns {string}
	 */
	getParamFromUrl( param: string, url: string ): string {
		const urlObj = new URL( url );
		return urlObj.searchParams.get( param ) as string;
	}

	/**
	 * Intercept and modify some network requests
	 */
	async maybeInterceptRequest() {
		// Only allow specific requests needed for tests
		// We're explicitly not allowing t.gif requests. We only need the request URL.
		const urlContainsAllowList = [
			'https://wordpress.com',
			'public-api.wordpress.com',
			's0.wp.com',
			's1.wp.com',
			's2.wp.com',
			'a8c-analytics.js',
			'/w.js',
			'fonts.googleapis.com',
			'.min.css',
		];

		await this.page.route( '**/*', ( route, request ) => {
			if (
				urlContainsAllowList.some( ( allowedString ) => request.url().includes( allowedString ) )
			) {
				if ( request.url().startsWith( 'https://stats.wp.com/w.js' ) ) {
					// Always get a fresh copy of w.js
					const wJsURL = new URL( request.url() );
					wJsURL.searchParams.set( 'v', Date.now().toString() );
					route.continue( { url: wJsURL.toString() } );
				} else {
					route.continue();
				}
			} else {
				route.abort();
			}
		} );
	}
}
