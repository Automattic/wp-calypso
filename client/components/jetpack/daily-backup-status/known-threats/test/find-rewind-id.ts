import { findRewindIdForBackupPeriod } from '../find-rewind-id';

const activity = (
	rewindId: string | undefined,
	activityIsRewindable = true,
	activityName = 'rewind__backup_complete_full'
) => ( {
	rewindId,
	activityIsRewindable,
	activityName,
} );

describe( 'findRewindIdForBackupPeriod', () => {
	it( 'picks the earliest backup-complete activity at or after the period', () => {
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

	it( 'ignores a realtime event before the backup-complete activity', () => {
		expect(
			findRewindIdForBackupPeriod(
				[ activity( '1792247350.2', true, 'post__published' ), activity( '1792247404.817' ) ],
				1792247305
			)
		).toBe( '1792247404.817' );
	} );

	it( "ignores the next backup's activity inside the window", () => {
		expect(
			findRewindIdForBackupPeriod(
				[ activity( '1792290600.4' ) ],
				1792247305,
				[ 1792290505, 1792247305, 1792160905 ]
			)
		).toBeNull();
		expect(
			findRewindIdForBackupPeriod(
				[ activity( '1792290600.4' ), activity( '1792247404.817' ) ],
				1792247305,
				[ 1792290505, 1792247305 ]
			)
		).toBe( '1792247404.817' );
	} );

	it( 'returns no id when the clean backup has no rewindable complete activity', () => {
		expect(
			findRewindIdForBackupPeriod(
				[
					activity( '1792247404.817', false ),
					activity( '1792247350.2', true, 'post__published' ),
					activity( '1792247500.1', true, 'rewind__backup_error' ),
				],
				1792247305,
				[ 1792290505, 1792247305 ]
			)
		).toBeNull();
	} );

	it( 'returns null when nothing matches', () => {
		expect( findRewindIdForBackupPeriod( [], 1792247305 ) ).toBeNull();
		expect( findRewindIdForBackupPeriod( [ activity( '1792247000.5' ) ], 1792247305 ) ).toBeNull();
		expect( findRewindIdForBackupPeriod( undefined, 1792247305 ) ).toBeNull();
	} );
} );
