/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { diffs, selection, ui } from '../reducer';
import {
	POST_EDIT,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_DIALOG_OPEN,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_SELECT,
	SELECTED_SITE_SET,
} from 'calypso/state/action-types';

const TEST_SITE_ID = 138211384;
const TEST_POST_ID = 165;

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'diffs', 'selection', 'ui', 'authors' ] );
	} );

	describe( '#diffs', () => {
		test( 'should default to an empty object', () => {
			const state = diffs( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		const validState = deepFreeze( {
			[ TEST_SITE_ID ]: {
				[ TEST_POST_ID ]: {
					revisions: {
						168: {
							post_date_gmt: '2017-12-12 18:24:37Z',
							post_modified_gmt: '2017-12-12 18:24:37Z',
							post_author: '20416304',
							id: 168,
							post_content: 'This is a super cool test!\nOh rly? Ya rly',
							post_excerpt: '',
							post_title: 'Yet Another Awesome Test Post!',
						},
						167: {
							post_date_gmt: '2017-12-12 18:24:28Z',
							post_modified_gmt: '2017-12-12 18:24:28Z',
							post_author: '20416304',
							id: 167,
							post_content: 'This is a super cool test!\nOh rly? Ya rly',
							post_excerpt: '',
							post_title: 'Yet Another Test Post',
						},
						166: {
							post_date_gmt: '2017-12-12 18:24:18Z',
							post_modified_gmt: '2017-12-12 18:24:18Z',
							post_author: '20416304',
							id: 166,
							post_content: 'This is a super cool test!',
							post_excerpt: '',
							post_title: 'Yet Another Test Post',
						},
					},

					'0:166': {
						from: 0,
						to: 166,
						diff: {
							post_title: [
								{ op: 'del', value: '' },
								{ op: 'add', value: 'Yet Another Test Post' },
								{ op: 'copy', value: '\n' },
							],
							post_content: [
								{ op: 'add', value: 'This is a super cool test!' },
								{ op: 'copy', value: '\n' },
							],
							totals: { del: 0, add: 10 },
						},
					},
					'167:168': {
						from: 167,
						to: 168,
						diff: {
							post_title: [
								{ op: 'copy', value: 'Yet Another' },
								{ op: 'add', value: ' Awesome' },
								{ op: 'copy', value: ' Test Post' },
								{ op: 'add', value: '!' },
								{ op: 'copy', value: '\n' },
							],
							post_content: [ { op: 'copy', value: 'This is a super cool test!\nOh rly? Ya rly' } ],
							totals: { add: 1 },
						},
					},
					'166:167': {
						from: 166,
						to: 167,
						diff: {
							post_title: [ { op: 'copy', value: 'Yet Another Test Post' } ],
							post_content: [
								{ op: 'copy', value: 'This is a super cool test!\n' },
								{ op: 'add', value: 'Oh rly? Ya rly' },
								{ op: 'copy', value: '\n' },
							],
							totals: { add: 4 },
						},
					},
				},
			},
		} );

		test( 'should not merge diff data without a siteId', () => {
			const state = diffs( validState, {
				type: POST_REVISIONS_RECEIVE,
				diffs: [
					{
						diff: {
							todo: 'fix this shape',
						},
						from: 88,
						to: 89,
					},
				],
			} );

			expect( state ).to.eql( validState );
		} );

		test( 'should merge diff & revisions', () => {
			const state = diffs( validState, {
				type: POST_REVISIONS_RECEIVE,
				siteId: TEST_SITE_ID,
				postId: TEST_POST_ID,
				diffs: {
					'168:169': {
						from: 168,
						to: 169,
						diff: {
							post_title: [ { op: 'copy', value: 'Yet Another Awesome Test Post!' } ],
							post_content: [
								{ op: 'copy', value: 'This is a super ' },
								{ op: 'add', value: 'duper ' },
								{ op: 'copy', value: 'cool test!\nOh rly? Ya rly' },
							],
							totals: { add: 1 },
						},
					},
				},
				revisions: {
					169: {
						post_date_gmt: '2017-12-14 18:24:37Z',
						post_modified_gmt: '2017-12-14 18:24:37Z',
						post_author: '20416304',
						id: 169,
						post_content: 'This is a super duper cool test!\nOh rly? Ya rly',
						post_excerpt: '',
						post_title: 'Yet Another Awesome Test Post!',
					},
					168: {
						post_date_gmt: '2017-12-12 18:24:37Z',
						post_modified_gmt: '2017-12-12 18:24:37Z',
						post_author: '20416304',
						id: 168,
						post_content: 'This is a super cool test!\nOh rly? Ya rly',
						post_excerpt: '',
						post_title: 'Yet Another Awesome Test Post!',
					},
				},
			} );

			expect( state ).to.eql( {
				[ TEST_SITE_ID ]: {
					[ TEST_POST_ID ]: {
						revisions: {
							169: {
								post_date_gmt: '2017-12-14 18:24:37Z',
								post_modified_gmt: '2017-12-14 18:24:37Z',
								post_author: '20416304',
								id: 169,
								post_content: 'This is a super duper cool test!\nOh rly? Ya rly',
								post_excerpt: '',
								post_title: 'Yet Another Awesome Test Post!',
							},
							168: {
								post_date_gmt: '2017-12-12 18:24:37Z',
								post_modified_gmt: '2017-12-12 18:24:37Z',
								post_author: '20416304',
								id: 168,
								post_content: 'This is a super cool test!\nOh rly? Ya rly',
								post_excerpt: '',
								post_title: 'Yet Another Awesome Test Post!',
							},
							167: {
								post_date_gmt: '2017-12-12 18:24:28Z',
								post_modified_gmt: '2017-12-12 18:24:28Z',
								post_author: '20416304',
								id: 167,
								post_content: 'This is a super cool test!\nOh rly? Ya rly',
								post_excerpt: '',
								post_title: 'Yet Another Test Post',
							},
							166: {
								post_date_gmt: '2017-12-12 18:24:18Z',
								post_modified_gmt: '2017-12-12 18:24:18Z',
								post_author: '20416304',
								id: 166,
								post_content: 'This is a super cool test!',
								post_excerpt: '',
								post_title: 'Yet Another Test Post',
							},
						},

						'168:169': {
							from: 168,
							to: 169,
							diff: {
								post_title: [ { op: 'copy', value: 'Yet Another Awesome Test Post!' } ],
								post_content: [
									{ op: 'copy', value: 'This is a super ' },
									{ op: 'add', value: 'duper ' },
									{ op: 'copy', value: 'cool test!\nOh rly? Ya rly' },
								],
								totals: { add: 1 },
							},
						},

						'167:168': {
							from: 167,
							to: 168,
							diff: {
								post_title: [
									{ op: 'copy', value: 'Yet Another' },
									{ op: 'add', value: ' Awesome' },
									{ op: 'copy', value: ' Test Post' },
									{ op: 'add', value: '!' },
									{ op: 'copy', value: '\n' },
								],
								post_content: [
									{ op: 'copy', value: 'This is a super cool test!\nOh rly? Ya rly' },
								],
								totals: { add: 1 },
							},
						},
						'166:167': {
							from: 166,
							to: 167,
							diff: {
								post_title: [ { op: 'copy', value: 'Yet Another Test Post' } ],
								post_content: [
									{ op: 'copy', value: 'This is a super cool test!\n' },
									{ op: 'add', value: 'Oh rly? Ya rly' },
									{ op: 'copy', value: '\n' },
								],
								totals: { add: 4 },
							},
						},
						'0:166': {
							from: 0,
							to: 166,
							diff: {
								post_title: [
									{ op: 'del', value: '' },
									{ op: 'add', value: 'Yet Another Test Post' },
									{ op: 'copy', value: '\n' },
								],
								post_content: [
									{ op: 'add', value: 'This is a super cool test!' },
									{ op: 'copy', value: '\n' },
								],
								totals: { del: 0, add: 10 },
							},
						},
					},
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
