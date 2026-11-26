import { combineReducers } from 'calypso/state/utils';
import {
	URL_ANALYZER_ANALYZE,
	URL_ANALYZER_ANALYZE_DONE,
	URL_ANALYZER_ANALYZE_SUCCESS,
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
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
