import { combineReducers } from 'calypso/state/utils';
import {
	URL_ANALYZER_ANALYZE,
	URL_ANALYZER_ANALYZE_DONE,
	URL_ANALYZER_ANALYZE_SUCCESS,
	URL_ANALYZER_ANALYZE_ERROR,
	URL_ANALYZER_RESET_ERROR,
} from '../../action-types';
import type { AnyAction } from 'redux';

const isAnalyzing = ( state = false, action: AnyAction ) => {
	switch ( action.type ) {
		case URL_ANALYZER_ANALYZE:
			return true;
		case URL_ANALYZER_ANALYZE_DONE:
			return false;
	}

	return state;
};

const analyzerError = ( state = null, action: AnyAction ) => {
	switch ( action.type ) {
		case URL_ANALYZER_ANALYZE_ERROR: {
			const { payload } = action;
			return payload;
		}
		case URL_ANALYZER_RESET_ERROR:
			return null;
		default:
			return state;
	}
};

const urlData = ( state = null, action: AnyAction ) => {
	switch ( action.type ) {
		case URL_ANALYZER_ANALYZE_SUCCESS: {
			const { payload } = action;
			return payload;
		}
		default:
			return state;
	}
};

const reducer = combineReducers( {
	isAnalyzing,
	urlData,
	analyzerError,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
