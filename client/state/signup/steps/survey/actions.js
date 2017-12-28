/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_STEPS_SURVEY_SET } from 'client/state/action-types';
import {
	composeAnalytics,
	recordCustomAdWordsRemarketingEvent,
	recordCustomFacebookConversionEvent,
	withAnalytics,
} from 'client/state/analytics/actions';

export function setSurvey( survey ) {
	const vertical = survey.vertical;
	const attributes = { vertical };

	return withAnalytics(
		composeAnalytics(
			recordCustomAdWordsRemarketingEvent( attributes ),
			recordCustomFacebookConversionEvent( 'VerticalSelectedEvent', attributes )
		)
	)( {
		type: SIGNUP_STEPS_SURVEY_SET,
		survey,
	} );
}
