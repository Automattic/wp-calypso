/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SURVEY_SET } from 'state/action-types';
import {
	composeAnalytics,
	recordCustomAdWordsRemarketingEvent,
	recordCustomFacebookConversionEvent,
	joinAnalytics
} from 'state/analytics/actions';

export function setSurvey( survey ) {
	const vertical = survey.vertical;
	const attributes = { vertical };
	const compositeAnalytics = composeAnalytics(
		recordCustomAdWordsRemarketingEvent( attributes ),
		recordCustomFacebookConversionEvent( 'VerticalSelectedEvent', attributes )
	);

	return joinAnalytics(
		compositeAnalytics,
		{
			type: SIGNUP_STEPS_SURVEY_SET,
			survey
		}
	);
}
