/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisionChanges from 'state/selectors/get-post-revision-changes';

describe( 'getPostRevisionChanges', () => {
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
						},
					},
				},
			},
		},
		users: {
			items: {},
		},
	};

	test( 'should return an empty array if the revision is not found', () => {
		expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 14 ) ).to.eql( {
			title: [],
			content: [],
		} );
	} );

	test( 'should compute diff changes based on revision dates', () => {
		const diff = getPostRevisionChanges( outOfOrderState, 12345678, 10, 12 );
		expect( diff.content ).to.eql( [
			{
				count: 1,
				value: 'Hello',
			},
			{
				count: 2,
				removed: true,
				value: ' World',
			},
		] );
		expect( diff.title ).to.eql( [
			{
				count: 1,
				value: 'Test',
			},
			{
				count: 2,
				removed: true,
				value: ' Title',
			},
		] );
	} );

	test( 'should compute diff changes for the oldest revision available against a clean slate', () => {
		const diff = getPostRevisionChanges( outOfOrderState, 12345678, 10, 11 );
		expect( diff.content ).to.eql( [
			{
				added: true,
				value: 'Hello World',
			},
		] );
		expect( diff.title ).to.eql( [
			{
				added: true,
				value: 'Test Title',
			},
		] );
	} );

	test( 'should properly decode HTML entities', () => {
		const diff = getPostRevisionChanges( outOfOrderState, 12345678, 10, 16 );
		expect( diff.content ).to.eql( [
			{
				added: true,
				value: 'L’usage d’un instrument savant',
			},
		] );
		expect( diff.title ).to.eql( [
			{
				added: true,
				value: 'Foo & Baz',
			},
		] );
	} );
} );
