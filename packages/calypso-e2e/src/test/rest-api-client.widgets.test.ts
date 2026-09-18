/**
 * Tests for RestAPIClient.deleteAllWidgets.
 */
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import nock from 'nock';
import { RestAPIClient, BEARER_TOKEN_URL } from '../rest-api-client';
import { SecretsManager } from '../secrets';
import type { Secrets } from '../secrets';

const fakeSecrets = {
	calypsoOauthApplication: {
		client_id: 'some_value',
		client_secret: 'some_value',
	},
} as unknown as Secrets;

jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation( () => fakeSecrets );

describe( 'RestAPIClient: deleteAllWidgets', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );

	const siteID = 12345;
	const listURL = restAPIClient.getRequestURL( '1.1', `/sites/${ siteID }/widgets` );
	const deleteURL = ( widgetID: string ) =>
		restAPIClient.getRequestURL( '1.1', `/sites/${ siteID }/widgets/widget:${ widgetID }/delete` );

	beforeEach( function () {
		nock.cleanAll();
		nock( BEARER_TOKEN_URL )
			.persist()
			.post( /.*/ )
			.reply( 200, {
				success: true,
				data: { bearer_token: 'abcdefghijklmn', token_links: [] },
			} );
	} );

	test( 'rejects when a widget deletion fails', async function () {
		nock( listURL.origin )
			.get( listURL.pathname )
			.reply( 200, { widgets: [ { id: 'authors-1' } ] } );

		nock( deleteURL( 'authors-1' ).origin )
			.post( deleteURL( 'authors-1' ).pathname )
			.reply( 200, { error: 'unauthorized', message: 'User cannot edit widgets.' } );

		await expect( restAPIClient.deleteAllWidgets( siteID ) ).rejects.toThrow( 'unauthorized' );
	} );
} );
