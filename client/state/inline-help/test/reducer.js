/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { popover, ui, requesting, search } from '../reducer';
import {
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_SHOW,
	INLINE_HELP_HIDE,
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
	INLINE_HELP_SELECT_RESULT,
	INLINE_HELP_SELECT_NEXT_RESULT,
} from 'state/action-types';

const API_RESULT_FIXTURE = [
	{
		id: 1,
		title: 'Some result',
	},
	{
		id: 2,
		title: 'Some other result',
	},
	{
		id: 3,
		title: 'Another result',
	},
	{
		id: 4,
		title: 'Yet another result',
	},
	{
		id: 5,
		title: 'Can you imagine more results?',
	},
	{
		id: 6,
		title: 'Surely, not another result?',
	},
];

describe( 'reducer', () => {
	describe( '#popover()', () => {
		test( 'should generate isVisible boolean prop', () => {
			const state = popover( null, {
				type: INLINE_HELP_POPOVER_SHOW,
			} );

			expect( state ).to.eql( {
				isVisible: true,
			} );
		} );
		test( 'should the existing visible status', () => {
			const original = deepFreeze( { isVisible: true } );
			const state = popover( original, {
				type: INLINE_HELP_POPOVER_HIDE,
			} );

			expect( state ).to.eql( {
				isVisible: false,
			} );
		} );
	} );

	describe( '#ui()', () => {
		test( 'should correct set isVisible prop to true', () => {
			const state = ui( null, {
				type: INLINE_HELP_SHOW,
			} );

			expect( state ).to.eql( {
				isVisible: true,
			} );
		} );

		test( 'should correct set isVisible prop to false', () => {
			const original = deepFreeze( { isVisible: true } );
			const state = ui( original, {
				type: INLINE_HELP_HIDE,
			} );

			expect( state ).to.eql( {
				isVisible: false,
			} );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should correctly set boolean flag to true for query key', () => {
			const testQuery = 'testQueryKey';
			const state = requesting( null, {
				type: INLINE_HELP_SEARCH_REQUEST,
				searchQuery: testQuery,
			} );

			expect( state ).to.eql( {
				[ testQuery ]: true,
			} );
		} );

		test( 'should correctly set boolean flag to false for query key on success', () => {
			const testQuery = 'testQueryKey';
			const original = deepFreeze( { [ testQuery ]: true } );
			const state = requesting( original, {
				type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
				searchQuery: testQuery,
			} );

			expect( state ).to.eql( {
				[ testQuery ]: false,
			} );
		} );

		test( 'should correctly set boolean flag to false for query key on failure', () => {
			const testQuery = 'testQueryKey';
			const original = deepFreeze( { [ testQuery ]: true } );
			const state = requesting( original, {
				type: INLINE_HELP_SEARCH_REQUEST_FAILURE,
				searchQuery: testQuery,
			} );

			expect( state ).to.eql( {
				[ testQuery ]: false,
			} );
		} );
	} );

	describe( '#search()', () => {
		test.each( [ 'testQueryKey', '' ] )(
			'should correctly set the current search query text',
			( testQuery ) => {
				const state = search( null, {
					type: INLINE_HELP_SEARCH_REQUEST,
					searchQuery: testQuery,
				} );

				expect( state ).to.eql( {
					searchQuery: testQuery,
				} );
			}
		);

		test( 'should correctly set search results keyed by search term', () => {
			const firstQuery = 'testQuery';
			const secondQuery = 'anotherQuery';

			let state = search(
				{},
				{
					type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
					searchQuery: firstQuery,
					searchResults: API_RESULT_FIXTURE,
				}
			);

			expect( state ).to.eql( {
				selectedResult: -1,
				items: {
					[ firstQuery ]: API_RESULT_FIXTURE,
				},
			} );

			// Also test results are appended to existing
			// keyed by search term
			state = search( state, {
				type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
				searchQuery: secondQuery,
				searchResults: API_RESULT_FIXTURE,
			} );

			expect( state ).to.eql( {
				selectedResult: -1,
				items: {
					[ firstQuery ]: API_RESULT_FIXTURE,
					[ secondQuery ]: API_RESULT_FIXTURE,
				},
			} );
		} );

		test( 'should correctly set the boolean to indicate presence of results that are from the API', () => {
			let state = search( null, {
				type: INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
				hasAPIResults: true,
			} );

			expect( state ).to.eql( {
				hasAPIResults: true,
			} );

			state = search( state, {
				type: INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
				hasAPIResults: false,
			} );

			expect( state ).to.eql( {
				hasAPIResults: false,
			} );
		} );

		describe( 'Search result selection', () => {
			test( 'should correctly set index of selected result', () => {
				let state = search( null, {
					type: INLINE_HELP_SELECT_RESULT,
					resultIndex: 2,
				} );

				expect( state ).to.eql( {
					selectedResult: 2,
				} );

				state = search(
					{},
					{
						type: INLINE_HELP_SELECT_RESULT,
						resultIndex: 4,
					}
				);

				expect( state ).to.eql( {
					selectedResult: 4,
				} );
			} );

			test( 'should correctly move between selected result indices of the current search query', () => {
				const initialState = {
					searchQuery: 'testResultSet',
					selectedResult: -1,
					items: {
						testResultSet: API_RESULT_FIXTURE,
					},
				};
				let state;

				state = search( initialState, {
					type: INLINE_HELP_SELECT_NEXT_RESULT,
				} );

				expect( state ).to.eql( {
					searchQuery: 'testResultSet',
					selectedResult: 0,
					items: {
						testResultSet: API_RESULT_FIXTURE,
					},
				} );

				state = search( state, {
					type: INLINE_HELP_SELECT_NEXT_RESULT,
				} );

				expect( state ).to.eql( {
					searchQuery: 'testResultSet',
					selectedResult: 1,
					items: {
						testResultSet: API_RESULT_FIXTURE,
					},
				} );
			} );

			test( 'should correctly reset the selected result index to 0 when end of search result items is reached', () => {
				const initialState = {
					searchQuery: 'testResultSet',
					selectedResult: 5,
					items: {
						testResultSet: API_RESULT_FIXTURE,
					},
				};

				const state = search( initialState, {
					type: INLINE_HELP_SELECT_NEXT_RESULT,
				} );

				expect( state ).to.eql( {
					searchQuery: 'testResultSet',
					selectedResult: 0,
					items: {
						testResultSet: API_RESULT_FIXTURE,
					},
				} );
			} );
		} );
	} );
} );
