import { AnyAction } from 'redux';
import { JETPACK_BACKUP_PREFLIGHT_TESTS_SET } from 'calypso/state/action-types';
import { PreflightState, PreflightTestStatus } from './types';
import { calculateOverallStatus } from './utils';

const initialState: PreflightState = {
	overallStatus: PreflightTestStatus.PENDING,
	tests: [],
};

const preflightReducer = ( state = initialState, action: AnyAction ): PreflightState => {
	switch ( action.type ) {
		case JETPACK_BACKUP_PREFLIGHT_TESTS_SET:
			if ( action.payload && Array.isArray( action.payload.tests ) ) {
				return {
					...state,
					tests: action.payload.tests,
					overallStatus: calculateOverallStatus( action.payload.tests ),
				};
			}
			return state;
		default:
			return state;
	}
};

export default preflightReducer;
