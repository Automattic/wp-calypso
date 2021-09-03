import { expect } from 'chai';
import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';
import getSearhQuery from 'calypso/state/inline-help/selectors/get-search-query';
import isInlineHelpPopoverVisible from 'calypso/state/inline-help/selectors/is-inline-help-popover-visible';

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
