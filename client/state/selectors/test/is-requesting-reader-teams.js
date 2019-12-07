/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingReaderTeams from 'state/selectors/is-requesting-reader-teams';

describe( 'isRequestingReaderTeams()', () => {
	test( 'should return false if not requesting teams', () => {
		const isRequesting = isRequestingReaderTeams( {
			reader: {
				teams: {
					isRequesting: false,
				},
			},
		} );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return true if requesting teams', () => {
		const isRequesting = isRequestingReaderTeams( {
			reader: {
				teams: {
					isRequesting: true,
				},
			},
		} );

		expect( isRequesting ).to.be.true;
	} );
} );
