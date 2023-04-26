import { REWIND_STORAGE_USAGE_LEVEL_SET } from '../../action-types';
import setUsageLevel from '../storage/reducer';
import { StorageUsageLevels } from '../storage/types';

describe( 'setUsageLevel', () => {
	it.each( [
		{
			state: undefined,
			action: {},
			expected: {
				usageLevel: StorageUsageLevels.Normal,
			},
		},
		{
			state: { usage: 100 },
			action: {},
			expected: {
				usage: 100,
			},
		},
		{
			state: {},
			action: {
				type: REWIND_STORAGE_USAGE_LEVEL_SET,
				usageLevel: StorageUsageLevels.Critical,
			},
			expected: {
				usageLevel: StorageUsageLevels.Critical,
			},
		},
		{
			state: {
				usage: 100,
			},
			action: {
				type: REWIND_STORAGE_USAGE_LEVEL_SET,
				usageLevel: StorageUsageLevels.Full,
			},
			expected: {
				usage: 100,
				usageLevel: StorageUsageLevels.Full,
			},
		},
		{
			state: {
				usage: 100,
				usageLevel: StorageUsageLevels.Critical,
			},
			action: {
				type: REWIND_STORAGE_USAGE_LEVEL_SET,
				usageLevel: StorageUsageLevels.Full,
			},
			expected: {
				usage: 100,
				usageLevel: StorageUsageLevels.Full,
			},
		},
	] )(
		'should set and return values appropriately when passed state and action type as REWIND_STORAGE_USAGE_LEVEL_SET, otherwise return the state as is',
		( { state, action, expected } ) => {
			const output = setUsageLevel( state, action );
			expect( output ).toEqual( expected );
		}
	);
} );
