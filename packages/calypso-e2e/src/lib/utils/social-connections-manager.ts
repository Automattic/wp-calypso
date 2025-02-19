import { Page } from 'playwright';

/**
 * A class to help manage social connections in the UI.
 */
export class SocialConnectionsManager {
	/**
	 * Constructor to set the props
	 */
	constructor(
		private page: Page,
		private siteId: number
	) {
		// Ensure the methods are bound to the class.
		this.isTargetUrl = this.isTargetUrl.bind( this );
	}

	/**
	 * Get the patterns for the social connections URLs
	 */
	get patterns() {
		return {
			CONNECTION_TESTS: new RegExp(
				// The request that deals with connection test results on Simple sites
				`wpcom/v2/(?<site_prefix>sites/${ this.siteId }/)?publicize/connections`
			),
			GET_POST: new RegExp(
				// The request that gets the post data in the editor
				`wp/v2/sites/${ this.siteId }/posts/[0-9]+`
			),
			POST_AUTOSAVES: new RegExp(
				// The request that deals with post autosaves in the editor
				`wp/v2/sites/${ this.siteId }/posts/[0-9]+/autosaves`
			),
		};
	}

	/**
	 * Get the test connections
	 */
	get testConnections() {
		return [
			{
				connection_id: '123456',
				display_name: 'Tumblr Test Connection',
				service_name: 'tumblr',
			},
			{
				connection_id: '654321',
				display_name: 'Bluesky Test Connection',
				service_name: 'bluesky',
			},
		];
	}

	/**
	 * Whether the URL is the one we want to intercept
	 */
	isTargetUrl( url: URL ) {
		return (
			this.isWpGetPostUrl( url ) ||
			this.isSimpleConnectionTestUrl( url ) ||
			this.isAtomicConnectionTestUrl( url )
		);
	}

	/**
	 * Check if the URL is a WP get post URL
	 */
	isWpGetPostUrl( url: URL ) {
		return (
			this.patterns.GET_POST.test( url.pathname ) &&
			// We don't want to intercept autosave requests.
			! this.patterns.POST_AUTOSAVES.test( url.pathname )
		);
	}

	/**
	 * Check if the URL is a connection test URL for simple sites
	 */
	isSimpleConnectionTestUrl( url: URL ) {
		return Boolean(
			url.searchParams.get( 'test_connections' ) === '1' &&
				this.patterns.CONNECTION_TESTS.exec( url.pathname )?.groups?.site_prefix
		);
	}

	/**
	 * Check if the URL is a connection test URL for atomic sites
	 */
	isAtomicConnectionTestUrl( url: URL ) {
		const match = this.patterns.CONNECTION_TESTS.exec( url.pathname );

		return Boolean(
			url.searchParams.get( 'test_connections' ) === '1' &&
				match &&
				// Atomic sites don't have a site prefix in the URL.
				! match.groups?.site_prefix
		);
	}

	/**
	 * Intercept the requests and to modify the response
	 */
	async interceptRequests() {
		await this.page.route( this.isTargetUrl, async ( route ) => {
			// Fetch original response.
			const response = await route.fetch();

			const result = await response.json();

			const url = new URL( route.request().url() );

			if ( this.isWpGetPostUrl( url ) ) {
				// For posts, add a test connection to post attributes.
				result.body.jetpack_publicize_connections.push( ...this.testConnections );
			} else if ( this.isSimpleConnectionTestUrl( url ) ) {
				// For connection tests on Simple sites, add test connections to the body.
				// Because the response is an object {"body":[],"status":200,"headers":{}}
				result.body.push( ...this.testConnections );
			} else if ( this.isAtomicConnectionTestUrl( url ) ) {
				// For Atomic connection tests, add test connections directly to the result.
				// because the response is already an array.
				result.push( ...this.testConnections );
			}

			await route.fulfill( {
				response,
				body: JSON.stringify( result ),
			} );
		} );
	}

	/**
	 * Clear the intercepts
	 */
	async clearIntercepts() {
		await this.page.unroute( this.isTargetUrl );
	}

	/**
	 * Wait for the connection test results response.
	 */
	async waitForConnectionTests() {
		await this.page.waitForResponse( ( response ) => {
			const url = new URL( response.url() );

			return this.isSimpleConnectionTestUrl( url ) || this.isAtomicConnectionTestUrl( url );
		} );
	}
}
