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
	POST_TYPES_RECEIVE,
	POST_TYPES_REQUEST,
	POST_TYPES_REQUEST_FAILURE,
	POST_TYPES_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { requesting, items } from '../reducer';

describe( 'reducer', () => {
	before( () => {
		sinon.stub( console, 'warn' );
	} );

	after( () => {
		console.warn.restore();
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items',
			'taxonomies'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set site ID to true value if request in progress', () => {
			const state = requesting( undefined, {
				type: POST_TYPES_REQUEST,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = requesting( deepFreeze( {
				2916284: true
			} ), {
				type: POST_TYPES_REQUEST,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true
			} );
		} );

		it( 'should set site ID to false if request finishes successfully', () => {
			const state = requesting( deepFreeze( {
				2916284: true
			} ), {
				type: POST_TYPES_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should set site ID to false if request finishes with failure', () => {
			const state = requesting( deepFreeze( {
				2916284: true
			} ), {
				type: POST_TYPES_REQUEST_FAILURE,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( deepFreeze( {
				2916284: true
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( deepFreeze( {
				2916284: true
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index post types by site ID, post type name pairing', () => {
			const state = items( null, {
				type: POST_TYPES_RECEIVE,
				siteId: 2916284,
				types: [
					{ name: 'post', label: 'Posts' },
					{ name: 'page', label: 'Pages' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
					page: { name: 'page', label: 'Pages' }
				}
			} );
		} );

		it( 'should accumulate sites', () => {
			const state = items( deepFreeze( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
					page: { name: 'page', label: 'Pages' }
				}
			} ), {
				type: POST_TYPES_RECEIVE,
				siteId: 77203074,
				types: [
					{ name: 'post', label: 'Posts' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
					page: { name: 'page', label: 'Pages' }
				},
				77203074: {
					post: { name: 'post', label: 'Posts' }
				}
			} );
		} );

		it( 'should override previous post types of same site ID', () => {
			const state = items( deepFreeze( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
					page: { name: 'page', label: 'Pages' }
				}
			} ), {
				type: POST_TYPES_RECEIVE,
				siteId: 2916284,
				types: [
					{ name: 'post', label: 'Posts' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' }
				}
			} );
		} );

		it( 'should persist state', () => {
			const state = items( deepFreeze( {
				2916284: {
					post: { name: 'post', label: 'Posts' }
				}
			} ), { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' }
				}
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( deepFreeze( {
				2916284: {
					post: { name: 'post', label: 'Posts' }
				}
			} ), { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' }
				}
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = items( deepFreeze( {
				post: { name: 'post', label: 'Posts' }
			} ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
			expect( console.warn ).to.have.been.calledOnce;
		} );
	} );
} );
