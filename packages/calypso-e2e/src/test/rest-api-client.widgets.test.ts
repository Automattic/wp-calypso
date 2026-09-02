/**
 * Tests for RestAPIClient.deleteAllWidgets, focused on awaiting the deletions.
 *
 * The method previously called `widgets.map( async ... )` and discarded the
 * resulting promises, so it resolved before a single widget had been deleted and
 * rejections surfaced as unhandled. The E2E step that clears widgets before the
 * Appearance > Widgets spec was therefore a no-op that could leave the editor in a
 * dirty state. These tests pin the awaited behavior.
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

	test( 'resolves only once every widget deletion has completed', async function () {
		nock( listURL.origin )
			.get( listURL.pathname )
			.reply( 200, { widgets: [ { id: 'authors-1' }, { id: 'text-2' } ] } );

		// The delay is what separates an awaited deletion from a discarded promise: a
		// fire-and-forget map resolves with both interceptors still pending.
		const first = nock( deleteURL( 'authors-1' ).origin )
			.post( deleteURL( 'authors-1' ).pathname )
			.delay( 50 )
			.reply( 200, [] );
		const second = nock( deleteURL( 'text-2' ).origin )
			.post( deleteURL( 'text-2' ).pathname )
			.delay( 50 )
			.reply( 200, [] );

		await restAPIClient.deleteAllWidgets( siteID );

		expect( first.isDone() ).toBe( true );
		expect( second.isDone() ).toBe( true );
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

	test( 'makes no delete calls when the site has no widgets', async function () {
		nock( listURL.origin ).get( listURL.pathname ).reply( 200, { widgets: [] } );

		await expect( restAPIClient.deleteAllWidgets( siteID ) ).resolves.toBeUndefined();
	} );
} );
