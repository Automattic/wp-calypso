/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisionChanges from '../get-post-revision-changes';

describe( 'getPostRevisionChanges', () => {
	const x20k = 'x'.repeat( 20000 );
	const x19921 = 'x'.repeat( 19921 );

	const outOfOrderState = {
		posts: {
			revisions: {
				revisions: {
					12345678: {
						10: {
							// NOTE: those are voluntarily out of order,
							// to test that we're selecting the right
							// base revision when computing changes.
							13: {
								id: 13,
								date: '2017-04-21T13:13:13Z',
								content: 'World',
								title: '',
							},
							11: {
								id: 11,
								date: '2017-04-21T11:11:11Z',
								content: 'Hello World',
								title: 'Test Title',
							},
							12: {
								id: 12,
								author: 2,
								date: '2017-04-21T12:12:12Z',
								content: 'Hello',
								title: 'Test',
							},
							15: {
								id: 15,
								author: 2,
								date: '2017-04-22T12:12:12Z',
								content: '',
								title: '',
							},
							16: {
								id: 16,
								author: 2,
								date: '2017-04-22T12:13:12Z',
								content: 'L&#8217;usage d&#8217;un instrument savant',
								title: 'Foo &amp; Baz',
							},
							17: {
								id: 17,
								author: 2,
								date: '2017-11-14T12:13:12Z',
								content: 'This revision has a really long title',
								title: x20k,
							},
							18: {
								id: 19,
								author: 2,
								date: '2017-11-15T12:13:13Z',
								content: 'x',
								title: 'This revision has short content & title',
							},
							19: {
								id: 19,
								author: 2,
								date: '2017-11-14T12:13:14Z',
								content: x20k,
								title: 'This revision has really long content',
							},
							20: {
								id: 20,
								author: 2,
								date: '2017-11-15T14:15:12Z',
								content: 'x',
								title: 'This revision has short content & title',
							},
							21: {
								id: 21,
								author: 2,
								date: '2017-11-15T14:16:12Z',
								content: x19921,
								title: 'This revision has total length of 19961',
							},
						},
					},
				},
			},
		},
		users: {
			items: {},
		},
	};

	const noChanges = {
		content: [],
		summary: {},
		title: [],
	};

	test( 'should return noChanges if the revision is not found', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 14 ) ).to.eql( noChanges );
	} );

	test( 'should compute diff changes based on revision dates', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 12 ) ).to.eql( {
			content: [
				{
					count: 1,
					value: 'Hello',
				},
				{
					count: 2,
					removed: true,
					value: ' World',
				},
			],
			summary: { added: 0, removed: 2 },
			title: [
				{
					count: 1,
					value: 'Test',
				},
				{
					count: 2,
					removed: true,
					value: ' Title',
				},
			],
		} );
	} );

	test( 'should compute diff changes for the oldest revision available against a clean slate', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 11 ) ).to.eql( {
			content: [
				{
					count: 3,
					added: true,
					value: 'Hello World',
				},
			],
			summary: { added: 4, removed: 0 },
			title: [
				{
					count: 3,
					added: true,
					value: 'Test Title',
				},
			],
		} );
	} );

	test( 'should properly decode HTML entities', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 16 ) ).to.eql( {
			content: [
				{
					count: 11,
					added: true,
					value: 'L’usage d’un instrument savant',
				},
			],
			summary: { added: 6, removed: 0 },
			title: [
				{
					count: 5,
					added: true,
					value: 'Foo & Baz',
				},
			],
		} );
	} );

	test( 'should return noChanges for really long titles', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 17 ) ).to.eql( {
			...noChanges,
			tooLong: true,
		} );
	} );

	test( 'should return noChanges for really long content', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 19 ) ).to.eql( {
			...noChanges,
			tooLong: true,
		} );
	} );

	test( 'should return changes for nearly too long content', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 21 ) ).to.eql( {
			content: [
				{ count: 1, removed: true, value: 'x' },
				{
					count: 1,
					added: true,
					value: x19921,
				},
			],
			summary: { added: 4, removed: 4 },
			title: [
				{ count: 6, value: 'This revision has ' },
				{ count: 1, removed: true, value: 'short' },
				{ count: 1, added: true, value: 'total' },
				{ count: 1, value: ' ' },
				{ count: 1, removed: true, value: 'content' },
				{ count: 1, added: true, value: 'length' },
				{ count: 1, value: ' ' },
				{ count: 1, removed: true, value: '&' },
				{ count: 1, added: true, value: 'of' },
				{ count: 1, value: ' ' },
				{ count: 1, removed: true, value: 'title' },
				{ count: 1, added: true, value: '19961' },
			],
		} );
	} );
} );
