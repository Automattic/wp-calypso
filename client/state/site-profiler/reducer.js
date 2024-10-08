import { combineReducers } from '@wordpress/data';
import {
	SITE_PROFILER_SET_REPORT,
	SITE_PROFILER_SET_LAST_VISITED_REPORT,
} from 'calypso/state/action-types';

const reportReducer = ( state = {}, action ) => {
	const { siteId, url, hash, pageId } = action;
	switch ( action.type ) {
		case SITE_PROFILER_SET_REPORT:
			return {
				...state,
				[ siteId ]: {
					...( state[ siteId ] || {} ),
					[ pageId ]: { url, hash },
				},
			};
		default:
			return state;
	}
};

const lastVisitedReportReducer = ( state = {}, action ) => {
	const { siteId, pageId } = action;
	switch ( action.type ) {
		case SITE_PROFILER_SET_LAST_VISITED_REPORT:
			return {
				...state,
				[ siteId ]: pageId,
			};
		default:
			return state;
	}
};
export default combineReducers( {
	report: reportReducer,
	lastVisitedReport: lastVisitedReportReducer,
} );
