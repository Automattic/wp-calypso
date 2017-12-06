/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { diffs, requesting, selection, ui } from '../reducer';
import {
	DESERIALIZE,
	POST_EDIT,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_DIALOG_OPEN,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
	POST_REVISIONS_SELECT,
	SELECTED_SITE_SET,
	SERIALIZE,
} from 'state/action-types';

const TEST_SITE_ID = 999999;

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'diffs', 'requesting', 'selection', 'ui' ] );
	} );

	describe( '#diffs', () => {
		test( 'should default to an empty object', () => {
			const state = diffs( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		const validState = deepFreeze( {
			[ TEST_SITE_ID ]: {
				'100:109': {
					diff: {
						todo: 'fix this shape',
					},
					from_revision_id: 100,
					to_revision_id: 109,
				},
				'110:111': {
					diff: {
						todo: 'fix this shape',
					},
					from_revision_id: 110,
					to_revision_id: 111,
				},
			},
		} );

		test( 'should persist state', () => {
			const state = diffs( validState, { type: SERIALIZE } );
			expect( state ).to.eql( validState );
		} );

		test( 'should load valid persisted state', () => {
			const state = diffs( validState, { type: DESERIALIZE } );
			expect( state ).to.eql( validState );
		} );

		test( 'should not load invalid persisted state', () => {
			const invalidState = deepFreeze( {
				stuff: {
					things: {},
				},
			} );

			const state = diffs( invalidState, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		test( 'should merge valid diff data to the same siteId', () => {
			const state = diffs( validState, {
				type: POST_REVISIONS_RECEIVE,
				siteId: TEST_SITE_ID,
				diffs: [
					{
						diff: {
							todo: 'fix this shape',
						},
						from_revision_id: 120,
						to_revision_id: 121,
					},
				],
			} );

			expect( state ).to.eql( {
				[ TEST_SITE_ID ]: {
					...state[ TEST_SITE_ID ],
					...{
						'120:121': {
							diff: {
								todo: 'fix this shape',
							},
							from_revision_id: 120,
							to_revision_id: 121,
						},
					},
				},
			} );
		} );

		test( 'should merge valid diff data to differing siteIds', () => {
			const state = diffs( validState, {
				type: POST_REVISIONS_RECEIVE,
				siteId: 12399999,
				diffs: [
					{
						diff: {
							todo: 'fix this shape',
						},
						from_revision_id: 88,
						to_revision_id: 89,
					},
				],
			} );

			expect( state ).to.eql( {
				...validState,
				12399999: {
					...{
						'88:89': {
							diff: {
								todo: 'fix this shape',
							},
							from_revision_id: 88,
							to_revision_id: 89,
						},
					},
				},
			} );
		} );

		test( 'should not merge diff data without a siteId', () => {
			const state = diffs( validState, {
				type: POST_REVISIONS_RECEIVE,
				diffs: [
					{
						diff: {
							todo: 'fix this shape',
						},
						from_revision_id: 88,
						to_revision_id: 89,
					},
				],
			} );

			expect( state ).to.eql( validState );
		} );
	} );

	describe( '#requesting', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set to `true` if a request is initiated', () => {
			const state = requesting( undefined, {
				type: POST_REVISIONS_REQUEST,
				siteId: 12345678,
				postId: 50,
			} );

			expect( state ).to.eql( {
				12345678: {
					50: true,
				},
			} );
		} );

		test( 'should set to `false` if the request is successful', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST_SUCCESS,
					siteId: 12345678,
					postId: 50,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: false,
				},
			} );
		} );

		test( 'should set to `false` if the request fails', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST_FAILURE,
					siteId: 12345678,
					postId: 50,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: false,
				},
			} );
		} );

		test( 'should support multiple sites', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST,
					siteId: 87654321,
					postId: 10,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: true,
				},
				87654321: {
					10: true,
				},
			} );
		} );

		test( 'should support multiple posts', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST,
					siteId: 12345678,
					postId: 10,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: true,
					10: true,
				},
			} );
		} );
	} );

	describe( '#selection', () => {
		test( 'should default to an empty object', () => {
			const state = selection( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should select provided revision id when none is selected', () => {
			const state = selection( deepFreeze( {} ), {
				type: POST_REVISIONS_SELECT,
				revisionId: 1215,
			} );
			expect( state ).to.eql( {
				revisionId: 1215,
			} );
		} );

		test( 'should select provided revision id when another is already selected', () => {
			const state = selection(
				deepFreeze( {
					revisionId: 1776,
				} ),
				{
					type: POST_REVISIONS_SELECT,
					revisionId: 1492,
				}
			);
			expect( state ).to.eql( {
				revisionId: 1492,
			} );
		} );

		test( 'should clear selection when selecting site', () => {
			const state = selection(
				deepFreeze( {
					revisionId: 1776,
				} ),
				{
					type: SELECTED_SITE_SET,
				}
			);
			expect( state ).to.eql( {
				revisionId: null,
			} );
		} );

		test( 'should clear selection when editing post', () => {
			const state = selection(
				deepFreeze( {
					revisionId: 1776,
				} ),
				{
					type: POST_EDIT,
				}
			);
			expect( state ).to.eql( {
				revisionId: null,
			} );
		} );
	} );

	describe( '#ui', () => {
		test( 'should default to an empty object', () => {
			const state = ui( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		describe( 'when POST_REVISIONS_DIALOG_OPEN action is disptached', () => {
			test( 'should set isDialogVisible to true', () => {
				const state = ui(
					deepFreeze( {
						isDialogVisible: false,
					} ),
					{
						type: POST_REVISIONS_DIALOG_OPEN,
					}
				);
				expect( state ).to.eql( {
					isDialogVisible: true,
				} );
			} );
		} );

		describe( 'when POST_REVISIONS_DIALOG_CLOSE action is disptached', () => {
			test( 'should set isDialogVisible to false', () => {
				const state = ui(
					deepFreeze( {
						isDialogVisible: true,
					} ),
					{
						type: POST_REVISIONS_DIALOG_CLOSE,
					}
				);
				expect( state ).to.eql( {
					isDialogVisible: false,
				} );
			} );
		} );
	} );
} );
