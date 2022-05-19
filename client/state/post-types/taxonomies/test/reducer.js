import deepFreeze from 'deep-freeze';
import {
	POST_TYPES_TAXONOMIES_RECEIVE,
	POST_TYPES_TAXONOMIES_REQUEST,
	POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
	POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { receivePostTypeTaxonomies } from '../actions';
import reducer, { requesting, items } from '../reducer';

describe( 'reducer', () => {
	console.warn = jest.fn();

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'requesting', 'items' ] )
		);
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track request fetching', () => {
			const state = requesting( undefined, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 2916284,
				postType: 'post',
			} );

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {} );
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

			expect( state ).toEqual( {
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

			expect( updatedState ).toEqual( {
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

			expect( finalState ).toEqual( {
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
			const state = serialize( items, original );

			expect( state ).toEqual( original );
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
			const state = deserialize( items, original );

			expect( state ).toEqual( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: [ true ],
				},
			} );
			const state = deserialize( items, original );

			expect( state ).toEqual( {} );
		} );
	} );
} );
