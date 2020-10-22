/**
 * Internal dependencies
 */
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';

describe( 'getRewindBackups()', () => {
	test( 'should return null if there is no rewind data', () => {
		const state = {};
		const backups = getRewindBackups( state, 123 );

		expect( backups ).toBeNull();
	} );

	test( 'should return null if the site is not tracked', () => {
		const state = {
			rewind: {
				123: {
					backups: [ 1, 2, 3 ],
				},
			},
		};
		const backups = getRewindBackups( state, 124 );

		expect( backups ).toBeNull();
	} );

	test( 'should return null if there are no backups data', () => {
		const state = {
			rewind: {
				123: {},
			},
		};
		const backups = getRewindBackups( state, 123 );

		expect( backups ).toBeNull();
	} );

	test( 'should return the backups for a site', () => {
		const state = {
			rewind: {
				123: {
					backups: [ 1, 2, 3 ],
				},
			},
		};
		const backups = getRewindBackups( state, 123 );

		expect( backups ).toEqual( [ 1, 2, 3 ] );
	} );
} );
