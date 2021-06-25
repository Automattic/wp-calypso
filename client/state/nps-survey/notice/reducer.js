/**
 * Internal dependencies
 */
import { NPS_SURVEY_DIALOG_IS_SHOWING } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const isNpsSurveyDialogShowing = ( state = false, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_DIALOG_IS_SHOWING: {
			const { isShowing } = action;
			return isShowing !== undefined ? isShowing : state;
		}
	}

	return state;
};

export default combineReducers( {
	isNpsSurveyDialogShowing,
} );
