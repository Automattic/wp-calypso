/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { NPS_SURVEY_DIALOG_IS_SHOWING } from 'calypso/state/action-types';
import {
	setNpsSurveyEligibility,
	setNpsConciergeSessionAvailaibility,
} from 'calypso/state/nps-survey/actions';

import 'calypso/state/nps-survey/init';

export function setNpsSurveyDialogShowing( isShowing ) {
	return {
		type: NPS_SURVEY_DIALOG_IS_SHOWING,
		isShowing,
	};
}

export function setupNpsSurveyDevTrigger() {
	return ( dispatch ) => {
		if ( config.isEnabled( 'nps-survey/dev-trigger' ) ) {
			window.npsSurvey = function ( isAvailableForSupportSession = false ) {
				dispatch( setNpsSurveyEligibility( true ) );
				dispatch( setNpsConciergeSessionAvailaibility( isAvailableForSupportSession ) );
			};
		}
	};
}
