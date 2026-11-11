import { fetchJetpackCrmExtensionDownload, JetpackCrmRequestError } from '../fetchers';

const originalFetch = global.fetch;

function mockResponse( body: object ) {
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		status: 200,
		json: async () => body,
	} );
}

afterEach( () => {
	global.fetch = originalFetch;
} );

describe( 'fetchJetpackCrmExtensionDownload', () => {
	test( 'returns an https download link', async () => {
		mockResponse( { success: true, download_url: 'https://example.com/extension.zip' } );

		await expect(
			fetchJetpackCrmExtensionDownload( 'https://app.example.com', 'jetpack-complete_abc', 'x' )
		).resolves.toEqual( { download_url: 'https://example.com/extension.zip' } );
	} );

	test.each( [ 'javascript:alert(1)', 'http://example.com/extension.zip', undefined ] )(
		'rejects a download link that is not https: %s',
		async ( downloadUrl ) => {
			mockResponse( { success: true, download_url: downloadUrl } );

			await expect(
				fetchJetpackCrmExtensionDownload( 'https://app.example.com', 'jetpack-complete_abc', 'x' )
			).rejects.toBeInstanceOf( JetpackCrmRequestError );
		}
	);
} );
