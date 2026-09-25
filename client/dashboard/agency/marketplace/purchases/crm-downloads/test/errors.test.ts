import { JetpackCrmRequestError } from '@automattic/api-core';
import { getDownloadErrorMessage, getExtensionsErrorMessage } from '../errors';

const CONNECTION_ERROR =
	'Error: Could not connect to download server. Please check your connection and try again.';

describe( 'getDownloadErrorMessage()', () => {
	test( 'uses the message for the HTTP status', () => {
		expect( getDownloadErrorMessage( new JetpackCrmRequestError( 400, '' ) ) ).toBe(
			'Error: Missing required fields'
		);
		expect( getDownloadErrorMessage( new JetpackCrmRequestError( 401, '' ) ) ).toBe(
			'Error: Invalid API key'
		);
		expect( getDownloadErrorMessage( new JetpackCrmRequestError( 403, '' ) ) ).toBe(
			'Error: Invalid license key format. Must be a Jetpack Complete license key.'
		);
		expect( getDownloadErrorMessage( new JetpackCrmRequestError( 404, '' ) ) ).toBe(
			'Error: Extension not found'
		);
	} );

	test( 'shows the server message when the server sends one', () => {
		expect(
			getDownloadErrorMessage( new JetpackCrmRequestError( 200, 'License has expired' ) )
		).toBe( 'Error: License has expired' );
	} );

	test( 'falls back to the connection error', () => {
		expect( getDownloadErrorMessage( new JetpackCrmRequestError( 500, '' ) ) ).toBe(
			CONNECTION_ERROR
		);
		expect( getDownloadErrorMessage( new TypeError( 'Failed to fetch' ) ) ).toBe(
			CONNECTION_ERROR
		);
	} );
} );

describe( 'getExtensionsErrorMessage()', () => {
	test( 'uses its own message for a missing list', () => {
		expect( getExtensionsErrorMessage( new JetpackCrmRequestError( 404, '' ) ) ).toBe(
			'Error: Extensions not found'
		);
	} );

	test( 'falls back to the connection error for other statuses', () => {
		expect( getExtensionsErrorMessage( new JetpackCrmRequestError( 403, '' ) ) ).toBe(
			CONNECTION_ERROR
		);
	} );
} );
