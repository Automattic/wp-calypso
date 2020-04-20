/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, items } from '../reducer';
import { receivePostTypeTaxonomies } from '../actions';
import {
	POST_TYPES_TAXONOMIES_RECEIVE,
	POST_TYPES_TAXONOMIES_REQUEST,
	POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
	POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'items' ] );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track request fetching', () => {
			const state = requesting( undefined, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 2916284,
				postType: 'post',
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
				},
			} );
		} );

		test( 'should accumulate requests for the same site', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
				},
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 2916284,
				postType: 'page',
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
					page: true,
				},
			} );
		} );

		test( 'should accumulate requests for distinct sites', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
					page: true,
				},
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 77203074,
				postType: 'post',
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
					page: true,
				},
				77203074: {
					post: true,
				},
			} );
		} );

		test( 'should track request success', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
					page: true,
				},
				77203074: {
					post: true,
				},
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
				siteId: 2916284,
				postType: 'post',
			} );

			expect( state ).to.eql( {
				2916284: {
					post: false,
					page: true,
				},
				77203074: {
					post: true,
				},
			} );
		} );

		test( 'should track request failure', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: true,
				},
				77203074: {
					post: true,
				},
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
				siteId: 2916284,
				postType: 'page',
			} );

			expect( state ).to.eql( {
				2916284: {
					post: false,
					page: false,
				},
				77203074: {
					post: true,
				},
			} );
		} );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track received post items by type, keyed by name', () => {
			const state = items( undefined, {
				type: POST_TYPES_TAXONOMIES_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				taxonomies: [
					{ name: 'category', label: 'Categories' },
					{ name: 'post_tag', label: 'Tags' },
				],
			} );

			expect( state ).to.eql( {
				2916284: {
					post: [
						{ name: 'category', label: 'Categories' },
						{ name: 'post_tag', label: 'Tags' },
					],
				},
			} );
		} );

		test( 'should replace state with latest payload', () => {
			const state = items( undefined, {
				type: POST_TYPES_TAXONOMIES_RECEIVE,
				siteId: 2916284,
				postType: 'page',
				taxonomies: [ { name: 'post_tag', label: 'Tags' } ],
			} );

			const updatedState = items( state, {
				type: POST_TYPES_TAXONOMIES_RECEIVE,
				siteId: 2916284,
				postType: 'page',
				taxonomies: [],
			} );

			expect( updatedState ).to.eql( {
				2916284: {
					page: [],
				},
			} );
		} );

		test( 'should accumulate items for multiple sites and post types', () => {
			const actions = [
				receivePostTypeTaxonomies( 2916284, 'page', [ { name: 'page_tag1', label: 'Tag 1' } ] ),
				receivePostTypeTaxonomies( 2916285, 'page', [ { name: 'page_tag2', label: 'Tag 2' } ] ),
				receivePostTypeTaxonomies( 2916284, 'post', [ { name: 'post_tag', label: 'Tag' } ] ),
			];

			const finalState = actions.reduce( items, undefined );

			expect( finalState ).to.eql( {
				2916284: {
					page: [ { name: 'page_tag1', label: 'Tag 1' } ],
					post: [ { name: 'post_tag', label: 'Tag' } ],
				},
				2916285: {
					page: [ { name: 'page_tag2', label: 'Tag 2' } ],
				},
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					post: [
						{
							name: 'category',
							label: 'Categories',
						},
						{
							name: 'post_tag',
							label: 'Tags',
						},
					],
				},
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: [
						{
							name: 'category',
							label: 'Categories',
						},
						{
							name: 'post_tag',
							label: 'Tags',
						},
					],
				},
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: [ true ],
				},
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
