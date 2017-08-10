/** @format */
/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { shouldSyncReaderFollows } from 'state/selectors';
import { MS_BETWEEN_SYNCS } from 'state/selectors/should-sync-reader-follows';

describe( 'shouldSyncReaderFollows', () => {
	it( 'should return true when last time is null', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: null,
					},
				},
			} )
		).to.be.true;
	} );

	it( 'should return true when last time is just over an hour ago', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: Date.now() - ( MS_BETWEEN_SYNCS + 1000 ),
					},
				},
			} )
		).to.be.true;
	} );

	it( 'should return false when last sync date is now', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: Date.now(),
					},
				},
			} )
		).to.be.false;
	} );

	it( 'should return false when last sync date is within an hour', () => {
		expect(
			shouldSyncReaderFollows( {
				reader: {
					follows: {
						lastSyncTime: Date.now() - ( MS_BETWEEN_SYNCS - 1000 ),
					},
				},
			} )
		).to.be.false;
	} );
} );
