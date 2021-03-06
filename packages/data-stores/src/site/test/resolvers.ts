/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

import { register } from '../';
import { getSite } from '../resolvers';

beforeAll( () => {
	register( { client_id: '', client_secret: '' } );
} );

describe( 'getSite', () => {
	it( 'should dispatch a fetchSite action object on boot and should return a receiveExistingSite action object on success', async () => {
		const siteId = 123456;
		const apiResponse = {
			ID: 1,
			name: 'My test site',
			description: '',
			URL: 'http://mytestsite12345.wordpress.com',
		};

		const generator = getSite( siteId );

		// getSite dispatches a FETCH_SITE action on boot
		expect( await generator.next().value ).toEqual( {
			type: 'FETCH_SITE',
		} );

		expect( await generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: `/sites/${ siteId }`,
			} ),
		} );

		expect( await generator.next( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_SITE',
			siteId,
			response: apiResponse,
		} );

		expect( generator.next().done ).toBe( true );
	} );

	it( 'should return a receiveExistingSiteFailed action object on fail', async () => {
		const siteId = 12345;
		const apiResponse = {
			status: 404,
			error: 'unknown_blog',
			message: 'Unknown blog',
		};

		const generator = getSite( siteId );

		// getSite dispatches a FETCH_SITE action on boot
		expect( await generator.next().value ).toEqual( {
			type: 'FETCH_SITE',
		} );

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: `/sites/${ siteId }`,
			} ),
		} );

		expect( await generator.throw( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_SITE_FAILED',
			siteId,
			response: undefined,
		} );

		expect( generator.next().done ).toBe( true );
	} );
} );
