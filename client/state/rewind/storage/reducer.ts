import { AnyAction } from 'redux';
import { REWIND_STORAGE_USAGE_LEVEL_SET } from 'calypso/state/action-types';
import { StorageUsageLevels } from './types';

const initialState = {
	usageLevel: StorageUsageLevels.Normal,
};

export default ( state = initialState, { type, usageLevel }: AnyAction ) => {
	if ( REWIND_STORAGE_USAGE_LEVEL_SET === type ) {
		return {
			...state,
			usageLevel: usageLevel,
		};
	}
	return state;
};
