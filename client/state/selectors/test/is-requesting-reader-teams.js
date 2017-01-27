/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingReaderTeams } from '../';

describe( 'isRequestingReaderTeams()', () => {
	it( 'should return false if not requesting teams', () => {
		const isRequesting = isRequestingReaderTeams( {
			reader: {
				teams: {
					isRequesting: false,
				}
			}
		} );

		expect( isRequesting ).to.be.false;
	} );

	it( 'should return true if requesting teams', () => {
		const isRequesting = isRequestingReaderTeams( {
			reader: {
				teams: {
					isRequesting: true,
				}
			}
		} );

		expect( isRequesting ).to.be.true;
	} );
} );
