import { isRequestingReaderTeams } from 'calypso/state/teams/selectors';

describe( 'isRequestingReaderTeams()', () => {
	test( 'should return false if not requesting teams', () => {
		const isRequesting = isRequestingReaderTeams( {
			teams: {
				isRequesting: false,
			},
		} );

		expect( isRequesting ).toBe( false );
	} );

	test( 'should return true if requesting teams', () => {
		const isRequesting = isRequestingReaderTeams( {
			teams: {
				isRequesting: true,
			},
		} );

		expect( isRequesting ).toBe( true );
	} );
} );
