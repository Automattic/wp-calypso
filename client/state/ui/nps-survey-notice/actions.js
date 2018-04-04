/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import { NPS_SURVEY_DIALOG_IS_SHOWING } from 'state/action-types';
import { setNpsSurveyEligibility } from 'state/nps-survey/actions';

export function setNpsSurveyDialogShowing( isShowing ) {
	return {
		type: NPS_SURVEY_DIALOG_IS_SHOWING,
		isShowing,
	};
}

export function setupNpsSurveyDevTrigger() {
	return dispatch => {
		if ( config.isEnabled( 'nps-survey/dev-trigger' ) ) {
			window.npsSurvey = function() {
				dispatch( setNpsSurveyEligibility( true ) );
			};
		}
	};
}
