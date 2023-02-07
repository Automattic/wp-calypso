import { getRewindStorageUsageLevel, getBackupCurrentSiteSize } from '../selectors';
import { StorageUsageLevels } from '../storage/types';

describe( 'getRewindStorageUsageLevel()', () => {
	it.each( [
		{
			state: {
				rewind: {
					123: {},
				},
			},
			siteId: 123,
			expected: StorageUsageLevels.Normal,
		},
		{
			state: {
				rewind: {
					123: {
						storage: {
							usageLevel: StorageUsageLevels.Full,
						},
					},
				},
			},
			siteId: 123,
			expected: StorageUsageLevels.Full,
		},
	] )(
		'should return values from StorageUsageLevels if passed, StorageUsageLevels.Normal otherwise',
		( { state, siteId, expected } ) => {
			const output = getRewindStorageUsageLevel( state, siteId );
			expect( output ).toBe( expected );
		}
	);
} );

describe( 'getBackupCurrentSiteSize()', () => {
	it.each( [
		{
			state: {
				rewind: {
					123: {
						size: {},
					},
				},
			},
			siteId: 123,
			expected: null,
		},
		{
			state: {
				rewind: {
					123: {
						size: {
							lastBackupSize: 1024,
						},
					},
				},
			},
			siteId: 123,
			expected: 1024,
		},
	] )(
		'should return the lastBackupSize if passed, null otherwise',
		( { state, siteId, expected } ) => {
			const output = getBackupCurrentSiteSize( state, siteId );
			expect( output ).toBe( expected );
		}
	);
} );
