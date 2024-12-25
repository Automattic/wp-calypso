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
				// The request that deals with connection test results
				`wpcom/v2/sites/${ this.siteId }/publicize/connection-test-results`
			),
			JP_CONNECTION_TESTS: new RegExp(
				// The request that deals with connection test results via Jetpack
				`jetpack/v4/publicize/connections\\?test_connections=1`
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
		const { GET_POST, POST_AUTOSAVES, CONNECTION_TESTS, JP_CONNECTION_TESTS } = this.patterns;

		// We don't want to intercept autosave requests.
		if ( GET_POST.test( url.pathname ) && ! POST_AUTOSAVES.test( url.pathname ) ) {
			return true;
		}

		return CONNECTION_TESTS.test( url.pathname ) || JP_CONNECTION_TESTS.test( url.toString() );
	}

	/**
	 * Intercept the requests and to modify the response
	 */
	async interceptRequests() {
		await this.page.route( this.isTargetUrl, async ( route ) => {
			// Fetch original response.
			const response = await route.fetch();

			let result = await response.json();

			const url = route.request().url();

			if ( this.patterns.GET_POST.test( url ) ) {
				// For posts, add a test connection to post attributes.
				result.body.jetpack_publicize_connections.push( ...this.testConnections );
			} else if ( this.patterns.CONNECTION_TESTS.test( url ) ) {
				// For connection tests, add test connections to the body.
				result.body.push( ...this.testConnections );
			} else if ( this.patterns.JP_CONNECTION_TESTS.test( url ) ) {
				// For JP connection tests, add test connections to the result.
				if ( Array.isArray( result ) ) {
					result.push( ...this.testConnections );
				} else {
					/**
					 * It's possible that there are other connections added while these tests are running.
					 * So we need to merge them.
					 *
					 * Since useAdminUiV1 flag is not activated on Atomic sites,
					 * the result is still in weird format, thus we need to convert to
					 *	{
					 *		"tumblr": {
					 *			"25481710": {
					 *				"display_name": "Untitled",
					 *				...
					 *			}
					 *		}
					 *	}
					 */
					result = this.testConnections.reduce( ( acc, cnxn ) => {
						acc[ cnxn.service_name ] = acc[ cnxn.service_name ] || {};

						acc[ cnxn.service_name ][ cnxn.connection_id ] = cnxn;

						return acc;
					}, result );
				}
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
			return (
				this.patterns.CONNECTION_TESTS.test( response.url() ) ||
				this.patterns.JP_CONNECTION_TESTS.test( response.url() )
			);
		} );
	}
}
