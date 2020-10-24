/**
 * Internal dependencies
 */
import getLastGoodRewindBackup from 'calypso/state/selectors/get-last-good-rewind-backup';

describe( 'getLastGoodRewindBackup()', () => {
	test( 'should return null if there is no rewind data', () => {
		const state = {};
		const backup = getLastGoodRewindBackup( state, 123 );

		expect( backup ).toBeNull();
	} );

	test( 'should return null if the site is not tracked', () => {
		const state = {
			rewind: {
				123: {
					backups: [
						{ id: 1, status: 'finished' },
						{ id: 2, status: 'finished' },
						{ id: 3, status: 'finished' },
					],
				},
			},
		};
		const backup = getLastGoodRewindBackup( state, 124 );

		expect( backup ).toBeNull();
	} );

	test( 'should return null if there are no backups data', () => {
		const state = {
			rewind: {
				123: {},
			},
		};
		const backup = getLastGoodRewindBackup( state, 123 );

		expect( backup ).toBeNull();
	} );

	test( 'should return undefined if there are no finished backups', () => {
		const state = {
			rewind: {
				123: {
					backups: [
						{ id: 1, status: 'failed' },
						{ id: 2, status: 'failed' },
						{ id: 3, status: 'failed' },
					],
				},
			},
		};
		const backup = getLastGoodRewindBackup( state, 123 );

		expect( backup ).toBeUndefined();
	} );

	test( 'should return the first finished backup on list', () => {
		const state = {
			rewind: {
				123: {
					backups: [
						{ id: 1, status: 'failed' },
						{ id: 2, status: 'finished' },
						{ id: 3, status: 'finished' },
					],
				},
			},
		};
		const backup = getLastGoodRewindBackup( state, 123 );

		expect( backup ).toEqual( { id: 2, status: 'finished' } );
	} );
} );
