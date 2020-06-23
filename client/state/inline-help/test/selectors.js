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

		expect( getSearhQuery( state ) ).to.eql( 'foo bar');
	} );

	test( 'should return empty string when no state', () => {
		const state = {
			inlineHelp: {},
		};

		expect( getSearhQuery( state ) ).to.eql( '');
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
							'foo': [
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

							'bar': [
								{
									title: 'Bar Item 0 title',
									description: 'Bar Item 0 description',
									link: 'http://bar.item-0.link',

								},
							],
						},
					},
				},
			},
		};

		expect( getInlineHelpSearchResultsForQuery( state, 'foo' ) ).to.deep.equal( [
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
} );
