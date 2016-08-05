/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	THEME_ACTIVATED,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { items, requestingAll, requesting } from '../reducer';

describe( 'reducer', () => {
	before( function() {
		sinon.stub( console, 'warn' );
	} );
	after( function() {
		console.warn.restore();
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'domains',
			'requestingAll',
			'items',
			'mediaStorage',
			'plans',
			'guidedTransfer',
			'vouchers',
			'requesting'
		] );
	} );

	describe( 'requestingAll()', () => {
		it( 'should default false', () => {
			const state = requestingAll( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should update fetching state on fetch', () => {
			const state = requestingAll( undefined, {
				type: SITES_REQUEST
			} );

			expect( state ).to.be.true;
		} );

		it( 'should update fetching state on success', () => {
			const state = requestingAll( true, {
				type: SITES_REQUEST_SUCCESS
			} );

			expect( state ).to.be.false;
		} );

		it( 'should update fetching state on failure', () => {
			const state = requestingAll( true, {
				type: SITES_REQUEST_FAILURE
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'can receive all sites', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog' },
					{ ID: 77203074, name: 'Another test site' }
				]
			} );
			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' }
			} );
		} );

		it( 'overwrites sites when all sites are received', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' }
			} );
			const state = items( original, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 77203074, name: 'A Bowl of Pho' }
				]
			} );
			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'A Bowl of Pho' }
			} );
		} );

		it( 'should index sites by ID', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should accumulate sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 77203074, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );
		} );

		it( 'should override previous site of same ID', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'Just You Wait' }
			} );
		} );

		it( 'should strip invalid keys on the received site object', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					slug: 'example.wordpress.com',
					updateComputedAttributes() {}
				}
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should strip invalid keys on the received site objects', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [ {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					slug: 'example.wordpress.com',
					updateComputedAttributes() {}
				} ]
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should update properties when wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar' } }
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar', wordads: true } }
			} );
		} );

		it( 'should do nothing when site is not loaded and wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should update the theme slug option when a theme is activated', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: {
						theme_slug: 'pub/twentythirteen'
					}
				}
			} );
			const state = items( original, {
				type: THEME_ACTIVATED,
				siteId: 2916284,
				theme: {
					name: 'Twenty Sixteen',
					stylesheet: 'pub/twentysixteen'
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: {
						theme_slug: 'pub/twentysixteen'
					}
				}
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should return initial state when state is invalid', () => {
			const original = deepFreeze( {
				2916284: { bad: true }
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track site request started', () => {
			const state = requesting( undefined, {
				type: SITE_REQUEST,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate site requests started', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: SITE_REQUEST,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true
			} );
		} );

		it( 'should track site request succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true
			} );
			const state = requesting( original, {
				type: SITE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true
			} );
		} );

		it( 'should track site request failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true
			} );
			const state = requesting( original, {
				type: SITE_REQUEST_FAILURE,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false
			} );
		} );
	} );
} );
