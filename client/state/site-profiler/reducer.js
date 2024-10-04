import { combineReducers } from '@wordpress/data';
import { SITE_PROFILER_SET_REPORT, SITE_PROFILER_SET_STEP } from 'calypso/state/action-types';

const reportReducer = ( state = {}, action ) => {
	const { siteId, url, hash } = action;
	switch ( action.type ) {
		case SITE_PROFILER_SET_REPORT:
			return { ...state, [ siteId ]: { url, hash } };
		default:
			return state;
	}
};

const stepReducer = ( state = {}, action ) => {
	const { siteId, step } = action;
	switch ( action.type ) {
		case SITE_PROFILER_SET_STEP:
			return { ...state, [ siteId ]: step };

		default:
			return state;
	}
};

export default combineReducers( {
	report: reportReducer,
	step: stepReducer,
} );
