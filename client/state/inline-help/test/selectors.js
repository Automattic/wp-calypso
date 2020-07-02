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
import getInlineHelpAdminResultsForQuery from 'state/inline-help/selectors/get-inline-help-admin-results-for-query';
import getInlineHelpContextualResultsForQuery from 'state/inline-help/selectors/get-inline-help-contextual-results-for-query';
import getAdminHelpResults from 'state/inline-help/selectors/get-admin-help-results';

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
		const result = getAdminHelpResults( {} );
		expect( result ).to.deep.equal( [] );
	} );

	test( 'should return results for `domain` term', () => {
		const results = getAdminHelpResults( {}, 'Add a new domain' );

		expect( results ).to.be.a( 'array' );
		expect( results ).to.not.deep.equal( [] );
		expect( results ).to.not.have.length( 0 );
	} );
} );

describe( 'getInlineHelpAdminResultsForQuery()', () => {
	test( 'should return only items admin itmes, according to the current query', () => {
		const state = {
			inlineHelp: {
				searchResults: {
					search: {
						searchQuery: 'foo',
						items: {
							foo: [
								{
									title: 'API response Item - title',
									description: 'API response Item - no support_type key',
									link: 'http://admin-section.item.link',
								},
								{
									title: 'Admin Section Item - title',
									description: 'Admin Section - description',
									link: 'http://admin-section.item.link',
									support_type: 'admin_section',
								},
								{
									title: 'Contextual Item - title',
									description: 'Contextual - description',
									link: 'http://contextual-item.item.link',
									support_type: 'contextual_help',
								},

							],
						},
					},
				},
			},
		};

		expect( getInlineHelpAdminResultsForQuery( state ) ).to.deep.equal( [
			{
				title: 'Admin Section Item - title',
				description: 'Admin Section - description',
				link: 'http://admin-section.item.link',
				support_type: 'admin_section',
			},
		] );
	} );
} );

describe( 'getInlineHelpContextualResultsForQuery()', () => {
	test( 'should return only items admin itmes, according to the current query', () => {
		const state = {
			inlineHelp: {
				searchResults: {
					search: {
						searchQuery: 'foo',
						items: {
							foo: [
								{
									title: 'API response Item - title',
									description: 'API response Item - no support_type key',
									link: 'http://admin-section.item.link',
								},
								{
									title: 'Admin Section Item - title',
									description: 'Admin Section - description',
									link: 'http://admin-section.item.link',
									support_type: 'admin_section',
								},
								{
									title: 'Contextual Item - title',
									description: 'Contextual - description',
									link: 'http://contextual-item.item.link',
									support_type: 'contextual_help',
								},

							],
						},
					},
				},
			},
		};

		expect( getInlineHelpContextualResultsForQuery( state ) ).to.deep.equal( [
			{
				title: 'Contextual Item - title',
				description: 'Contextual - description',
				link: 'http://contextual-item.item.link',
				support_type: 'contextual_help',
			},
		] );
	} );
} );
