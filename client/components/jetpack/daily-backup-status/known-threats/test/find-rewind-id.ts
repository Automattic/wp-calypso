import { findRewindIdForBackupPeriod } from '../find-rewind-id';

const activity = ( rewindId: string | undefined, activityIsRewindable = true ) => ( {
	rewindId,
	activityIsRewindable,
} );

describe( 'findRewindIdForBackupPeriod', () => {
	it( 'picks the earliest rewindable activity at or after the period', () => {
		expect(
			findRewindIdForBackupPeriod(
				[ activity( '1792250000.1' ), activity( '1792247404.817' ), activity( '1792248000' ) ],
				1792247305
			)
		).toBe( '1792247404.817' );
	} );

	it( 'accepts an activity exactly at the period', () => {
		expect( findRewindIdForBackupPeriod( [ activity( '1792247305' ) ], 1792247305 ) ).toBe(
			'1792247305'
		);
	} );

	it( 'ignores earlier and non-rewindable activities', () => {
		expect(
			findRewindIdForBackupPeriod(
				[
					activity( '1792247000.5' ),
					activity( '1792247404.817', false ),
					activity( undefined ),
					activity( '1792249000' ),
				],
				1792247305
			)
		).toBe( '1792249000' );
	} );

	it( 'returns null when nothing matches', () => {
		expect( findRewindIdForBackupPeriod( [], 1792247305 ) ).toBeNull();
		expect( findRewindIdForBackupPeriod( [ activity( '1792247000.5' ) ], 1792247305 ) ).toBeNull();
		expect( findRewindIdForBackupPeriod( undefined, 1792247305 ) ).toBeNull();
	} );
} );
