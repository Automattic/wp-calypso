/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isInlineHelpPopoverVisible from 'calypso/state/inline-help/selectors/is-inline-help-popover-visible';
import getSearhQuery from 'calypso/state/inline-help/selectors/get-search-query';
import getInlineHelpSearchResultsForQuery from 'calypso/state/inline-help/selectors/get-inline-help-search-results-for-query';
import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';

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

describe( 'getAdminSectionsResults()', () => {
	test( 'should return an empty array when there is no search term', () => {
		const result = getAdminHelpResults( {
			ui: {
				selectedSiteId: 1,
			},
			sites: {},
		} );
		expect( result ).to.deep.equal( [] );
	} );

	test( 'should return results for `domain` term', () => {
		const results = getAdminHelpResults(
			{
				ui: {
					selectedSiteId: 1,
				},
				sites: {},
			},
			'Add a new domain'
		);

		expect( results ).to.be.a( 'array' );
		expect( results ).to.not.deep.equal( [] );
		expect( results ).to.not.have.length( 0 );
	} );
} );
