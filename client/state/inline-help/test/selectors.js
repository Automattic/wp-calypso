/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isInlineHelpPopoverVisible from 'state/inline-help/selectors/is-inline-help-popover-visible';
import getSearhQuery from 'state/inline-help/selectors/get-search-query';
import getInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/get-inline-help-search-results-for-query';
import getAdminHelpResults, { filterListBySearchTerm } from 'state/inline-help/selectors/get-admin-help-results';

describe( '#isInlineHelpPopoverVisible()', () => {
	test( 'should return if the popover is visible', () => {
		const state = {
			inlineHelp: {
				popover: {
					isVisible: true,
				},
			},
		};

		expect( isInlineHelpPopoverVisible( state ) ).to.be.true;
	} );
} );

describe( '#getSearhQuery()', () => {
	test( 'should return the search query', () => {
		const state = {
			inlineHelp: {
				searchResults: {
					search: {
						searchQuery: 'foo bar',
					},
				},
			},
		};

		expect( getSearhQuery( state ) ).to.equal( 'foo bar' );
	} );

	test( 'should return empty string when no state', () => {
		const state = {
			inlineHelp: {},
		};

		expect( getSearhQuery( state ) ).to.be.string;
	} );
} );

describe( '#getInlineHelpSearchResultsForQuery()', () => {
	test( 'should return items according to the current query', () => {
		const state = {
			inlineHelp: {
				searchResults: {
					search: {
						searchQuery: 'foo',
						items: {
							foo: [
								{
									title: 'Foo Item 0 title',
									description: 'Foo Item 0 description',
									link: 'http://foo.item-0.link',
								},
								{
									title: 'Foo Item 1 title',
									description: 'Foo Item 1 description',
									link: 'http://foo.item-1.link',
								},
							],
						},
					},
				},
			},
		};

		expect( getInlineHelpSearchResultsForQuery( state ) ).to.deep.equal( [
			{
				title: 'Foo Item 0 title',
				description: 'Foo Item 0 description',
				link: 'http://foo.item-0.link',
			},
			{
				title: 'Foo Item 1 title',
				description: 'Foo Item 1 description',
				link: 'http://foo.item-1.link',
			},
		] );
	} );

	test( 'should return null when no items for given query', () => {
		const state = {
			inlineHelp: {
				searchResults: {
					search: {
						searchQuery: 'bar',
						items: {
							foo: [
								{
									title: 'Foo Item 0 title',
									description: 'Foo Item 0 description',
									link: 'http://foo.item-0.link',
								},
								{
									title: 'Foo Item 1 title',
									description: 'Foo Item 1 description',
									link: 'http://foo.item-1.link',
								},
							],
						},
					},
				},
			},
		};

		expect( getInlineHelpSearchResultsForQuery( state ) ).to.be.a( 'array' );
		expect( getInlineHelpSearchResultsForQuery( state ) ).to.have.length( 0 );
		expect( getInlineHelpSearchResultsForQuery( state ) ).to.deep.equal( [] );
	} );

	test( 'should return empty string when no items', () => {
		const state = {
			inlineHelp: {
				searchResults: {
					search: {
						searchQuery: '',
						items: {},
					},
				},
			},
		};

		expect( getInlineHelpSearchResultsForQuery( state ) ).to.be.a( 'array' );
		expect( getInlineHelpSearchResultsForQuery( state ) ).to.have.length( 0 );
		expect( getInlineHelpSearchResultsForQuery( state ) ).to.deep.equal( [] );
	} );
} );

describe( 'Admin section search and filters', () => {
	describe( 'getAdminSectionsResults()', () => {
		test( 'should return `[]` when there is no search term', () => {
			const result = getAdminHelpResults( {} );
			expect( result ).to.deep.equal( [] );
		} );

		test( 'should return admin help results for `domain` term', () => {
			const results = getAdminHelpResults( {}, 'Add a new domain' );
			expect( results ).to.be.a( 'array' );
			expect( results ).to.not.deep.equal( [] );
			expect( results ).to.not.have.length( 0 );
		} );
	} );

	describe( 'filterListBySearchTerm()', () => {
		const mockCollection = [
			{
				title: 'The best section',
				description: 'Better than that other section.',
				link: `/best/section/eva`,
				synonyms: [ 'yolo', 'gud' ],
				icon: 'beta',
			},
			{
				title: 'Quite a good page',
				description: 'A rather agreeable page if you ask me.',
				link: `/acceptable/page`,
				synonyms: [ 'hi', 'bye' ],
				icon: 'gamma',
			},
		];

		test( 'should ignore non-word characters and return `[]`', () => {
			const result = filterListBySearchTerm(
				"<$(*&#\\\\\\'''''>",
				mockCollection
			);
			expect( result ).to.deep.equal( [] );
		} );

		test( 'should return `[]` for no matches', () => {
			const result = filterListBySearchTerm( 'ciao', mockCollection );
			expect( result ).to.deep.equal( [] );
		} );

		test( 'should return a direct match', () => {
			const result = filterListBySearchTerm(
				'The best section',
				mockCollection
			);
			expect( result ).to.deep.equal( [
				{
					description: 'Better than that other section.',
					icon: 'beta',
					key: 'The best section',
					link: '/best/section/eva',
					synonyms: [ 'yolo', 'gud' ],
					title: 'The best section',
					type: 'internal',
				},
			] );
		} );

		test( 'should return a partial match', () => {
			const result = filterListBySearchTerm( 'best section', mockCollection );
			expect( result ).to.deep.equal( [
				{
					description: 'Better than that other section.',
					icon: 'beta',
					key: 'The best section',
					link: '/best/section/eva',
					synonyms: [ 'yolo', 'gud' ],
					title: 'The best section',
					type: 'internal',
				},
			] );
		} );

		test( 'should return a synonym match', () => {
			const result = filterListBySearchTerm( 'yolo', mockCollection );
			expect( result ).to.deep.equal( [
				{
					description: 'Better than that other section.',
					icon: 'beta',
					key: 'The best section',
					link: '/best/section/eva',
					synonyms: [ 'yolo', 'gud' ],
					title: 'The best section',
					type: 'internal',
				},
			] );
		} );
	} );
} );
