import { combineReducers } from 'calypso/state/utils';
import {
	URL_ANALYZER_ANALYZE,
	URL_ANALYZER_ANALYZE_DONE,
	URL_ANALYZER_ANALYZE_SUCCESS,
} from '../../action-types';

const isAnalyzing = ( state = false, action ) => {
	switch ( action.type ) {
		case URL_ANALYZER_ANALYZE:
			return true;
		case URL_ANALYZER_ANALYZE_DONE:
			return false;
	}

	return state;
};

const urlData = ( state = null, action ) => {
	switch ( action.type ) {
		case URL_ANALYZER_ANALYZE_SUCCESS: {
			const { data } = action;
			return data;
		}
		default:
			return state;
	}
};

export default combineReducers( {
	isAnalyzing,
	urlData,
} );
