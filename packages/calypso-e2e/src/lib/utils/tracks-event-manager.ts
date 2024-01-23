import { Page, Request } from 'playwright';

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
	private timeout: number;

	/**
	 * Construct an instance of the Tracks event manager class
	 * @param page
	 * @param timeout
	 */
	constructor( page: Page, timeout: number = 10000 ) {
		this.page = page;
		this.timeout = timeout;
	}

	/**
	 * Initialize the Tracks event manager
	 */
	async init() {
		this.maybeInterceptRequest();
		this.allowTestsToFireEvents();
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
	 * @param url
	 */
	async navigateToUrl( url: string ) {
		await this.page.goto( url, { timeout: this.timeout } );
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
			{ timeout: this.timeout }
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
	maybeInterceptRequest() {
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

		this.page.route( '**/*', ( route, request ) => {
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
