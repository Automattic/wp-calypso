/**
 * Internal dependencies
 */
import {
	NPS_SURVEY_DIALOG_IS_SHOWING,
} from 'state/action-types';

export function setNpsSurveyDialogShowing( isShowing ) {
	return {
		type: NPS_SURVEY_DIALOG_IS_SHOWING,
		isShowing,
	};
}
