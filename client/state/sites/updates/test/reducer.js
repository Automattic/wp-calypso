/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, requesting, wordpressUpdateStatus, errors } from '../reducer';
import {
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
	SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
	SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
	SITE_PLUGIN_UPDATED,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'requesting',
			'wordpressUpdateStatus',
			'errors',
		] );
	} );

	describe( '#items()', () => {
		const exampleUpdates = {
			plugins: 1,
			themes: 1,
			total: 2,
			translations: 0,
			wordpress: 0,
		};
		const someOtherUpdates = {
			...exampleUpdates,
			plugins: 0,
			total: 1,
		};

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store all updates when receiving site updates', () => {
			const state = items( undefined, {
				type: SITE_UPDATES_RECEIVE,
				siteId: 2916284,
				updates: exampleUpdates,
			} );

			expect( state ).to.eql( {
				2916284: exampleUpdates,
			} );
		} );

		test( 'should accumulate updates when receiving site updates', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
			} );
			const state = items( original, {
				type: SITE_UPDATES_RECEIVE,
				siteId: 77203074,
				updates: exampleUpdates,
			} );

			expect( state ).to.eql( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should overwrite updates when receiving site updates', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
			const state = items( original, {
				type: SITE_UPDATES_RECEIVE,
				siteId: 2916284,
				updates: someOtherUpdates,
			} );

			expect( state ).to.eql( {
				2916284: someOtherUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should store site updates when receiving a site', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, updates: exampleUpdates },
			} );

			expect( state ).to.eql( {
				2916284: exampleUpdates,
			} );
		} );

		test( 'should accumulate site updates when receiving a site', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 77203074, updates: exampleUpdates },
			} );

			expect( state ).to.eql( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should overwrite site updates when receiving a site', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, updates: someOtherUpdates },
			} );

			expect( state ).to.eql( {
				2916284: someOtherUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should not store updates if missing when receiving a site', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: { ID: 2916284 },
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store all updates when receiving sites', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 2916284, updates: exampleUpdates },
					{ ID: 77203074, updates: exampleUpdates },
				],
			} );

			expect( state ).to.eql( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should accumulate updates when receiving sites', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
			} );
			const state = items( original, {
				type: SITES_RECEIVE,
				sites: [ { ID: 77203074, updates: exampleUpdates } ],
			} );

			expect( state ).to.eql( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should overwrite updates when receiving sites', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
				77203074: exampleUpdates,
			} );
			const state = items( original, {
				type: SITES_RECEIVE,
				sites: [ { ID: 2916284, updates: someOtherUpdates } ],
			} );

			expect( state ).to.eql( {
				2916284: someOtherUpdates,
				77203074: exampleUpdates,
			} );
		} );

		test( 'should not store updates if missing when receiving sites', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [ { ID: 2916284 } ],
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should reduce wordpress and total updates count after successful wordpress update', () => {
			const original = deepFreeze( {
				2916284: {
					plugins: 1,
					themes: 1,
					total: 4,
					translations: 1,
					wordpress: 1,
				},
				77203074: exampleUpdates,
			} );
			const state = items( original, {
				type: SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: {
					plugins: 1,
					themes: 1,
					total: 3,
					translations: 1,
					wordpress: 0,
				},
				77203074: exampleUpdates,
			} );
		} );

		test( 'should reduce plugins and total updates count after successful plugin update', () => {
			const original = deepFreeze( {
				2916284: {
					plugins: 1,
					themes: 1,
					total: 4,
					translations: 1,
					wordpress: 1,
				},
				77203074: exampleUpdates,
			} );
			const state = items( original, {
				type: SITE_PLUGIN_UPDATED,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: {
					plugins: 0,
					themes: 1,
					total: 3,
					translations: 1,
					wordpress: 1,
				},
				77203074: exampleUpdates,
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: exampleUpdates,
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should return initial state when state is invalid', () => {
			const original = deepFreeze( {
				2916284: { plugins: false },
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track site updates request started', () => {
			const state = requesting( undefined, {
				type: SITE_UPDATES_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate site updates requests started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: SITE_UPDATES_REQUEST,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track site updates request succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_UPDATES_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track site updates request failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_UPDATES_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );

	describe( 'wordpressUpdateStatus()', () => {
		test( 'should default to an empty object', () => {
			const state = wordpressUpdateStatus( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track site wordpress core update status request succeeded', () => {
			const original = deepFreeze( {
				77203074: true,
			} );
			const state = wordpressUpdateStatus( original, {
				type: SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track site wordpress core update status request failed', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = wordpressUpdateStatus( original, {
				type: SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: false,
			} );
		} );
	} );

	describe( 'errors()', () => {
		test( 'should default to an empty object', () => {
			const state = errors( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track site updates request started', () => {
			const state = errors( undefined, {
				type: SITE_UPDATES_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
			} );
		} );

		test( 'should accumulate site updates requests started', () => {
			const original = deepFreeze( {
				2916284: false,
			} );
			const state = errors( original, {
				type: SITE_UPDATES_REQUEST,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );

		test( 'should track site updates request succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = errors( original, {
				type: SITE_UPDATES_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track site updates request failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: false,
			} );
			const state = errors( original, {
				type: SITE_UPDATES_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );
	} );
} );
