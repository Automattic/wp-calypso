import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';
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

		expect( isInlineHelpPopoverVisible( state ) ).toBe( true );
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
		expect( result ).toEqual( [] );
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

		expect( results.length ).toBeGreaterThan( 0 );
	} );
} );
