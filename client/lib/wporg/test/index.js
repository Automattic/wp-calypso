import { fetchPluginInformation } from '..';

global.fetch = jest.fn();

describe( 'wporg getRequest', () => {
	test( 'attaches the request URL to network errors', async () => {
		const failure = new TypeError( 'fetch failed' );
		fetch.mockRejectedValueOnce( failure );

		await expect( fetchPluginInformation( 'akismet', 'en' ) ).rejects.toBe( failure );
		expect( failure.url ).toContain( 'https://api.wordpress.org/plugins/info/1.2/' );
		expect( failure.url ).toContain( 'request%5Bslug%5D=akismet' );
	} );
} );
