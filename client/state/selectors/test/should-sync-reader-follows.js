import shouldSyncReaderFollows, {
	MS_BETWEEN_SYNCS,
} from 'calypso/state/selectors/should-sync-reader-follows';

describe( 'shouldSyncReaderFollows', () => {
	test( 'should return true when last time is null', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: null,
					},
				},
			} )
		).toBe( true );
	} );

	test( 'should return true when last time is just over an hour ago', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: Date.now() - ( MS_BETWEEN_SYNCS + 1000 ),
					},
				},
			} )
		).toBe( true );
	} );

	test( 'should return false when last sync date is now', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: Date.now(),
					},
				},
			} )
		).toBe( false );
	} );

	test( 'should return false when last sync date is within an hour', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: Date.now() - ( MS_BETWEEN_SYNCS - 1000 ),
					},
				},
			} )
		).toBe( false );
	} );
} );
