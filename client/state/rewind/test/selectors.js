import { getBackupRetentionDays, getRewindStorageUsageLevel } from '../selectors';
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

describe( 'getBackupRetentionDays()', () => {
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
			expected: undefined,
		},
		{
			state: {
				rewind: {
					123: {
						size: {
							retentionDays: 30,
						},
					},
				},
			},
			siteId: 123,
			expected: 30,
		},
	] )(
		'should return the retentionDays if passed, null otherwise',
		( { state, siteId, expected } ) => {
			const output = getBackupRetentionDays( state, siteId );
			expect( output ).toBe( expected );
		}
	);
} );
