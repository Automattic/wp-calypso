/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isInlineHelpPopoverVisible from 'state/inline-help/selectors/is-inline-help-popover-visible';
import getSearhQuery from 'state/inline-help/selectors/get-search-query';

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
