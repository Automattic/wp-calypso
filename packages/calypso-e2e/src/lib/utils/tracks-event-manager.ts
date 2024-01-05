import { Page, Request } from 'playwright';

/**
 * A class to help monitor Tracks events in the browser
 */
export class TracksEventManager {
	private page: Page;
	private timeout: number;

	/**
	 * Construct an instance of the Tracks event class
	 * @param page
	 * @param timeout
	 */
	constructor( page: Page, timeout: number = 10000 ) {
		this.page = page;
		this.timeout = timeout;
		this.blockUnnecessaryRequests();
	}

	/**
	 * Navigate to a URL
	 * @param url
	 */
	async navigateToUrl( url: string ) {
		try {
			await this.page.goto( url, { timeout: this.timeout } );
		} catch ( error ) {
			console.error( error );
		}
	}

	/**
	 * Check if a Tracks event fired
	 * @param eventName
	 * @returns
	 */
	async didEventFire( eventName: string ) {
		return !! ( await this.getRequestUrlForEvent( eventName ) );
	}

	/**
	 * Get the request URL of a Tracks event
	 * @param eventName
	 * @returns
	 */
	async getRequestUrlForEvent( eventName: string ): Promise< string > {
		const pixelUrl: string = 'https://pixel.wp.com/t.gif';
		return new Promise( ( resolve ) => {
			const timeoutId = setTimeout( () => {
				resolve( '' );
			}, this.timeout );

			const handler = ( request: Request ) => {
				if (
					request.url().startsWith( pixelUrl ) &&
					this.getParamFromUrl( '_en', request.url() ) === eventName
				) {
					this.page.removeListener( 'request', handler );
					clearTimeout( timeoutId );
					resolve( request.url() );
				}
			};

			this.page.on( 'request', handler );
		} );
	}

	/**
	 * Get a parameter value from a URL
	 * @param param
	 * @param url
	 * @returns
	 */
	getParamFromUrl( param: string, url: string ): string {
		const urlObj = new URL( url );
		return urlObj.searchParams.get( param ) as string;
	}

	/**
	 * Block unnecessary network requests
	 */
	blockUnnecessaryRequests() {
		// Only allow specific requests needed for tests
		// We're specific not allowing the t.gif requests. We only need the request URL.
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
				route.continue();
			} else {
				route.abort();
			}
		} );
	}
}
