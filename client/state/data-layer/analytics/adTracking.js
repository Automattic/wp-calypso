/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { recordSelectedVertical } from 'lib/analytics/ad-tracking';
import { SIGNUP_STEPS_SURVEY_SET } from 'state/action-types';

function handleSignupStepsSurveyStart( _, action, next ) {
	next( action );

	const vertical = get( action, 'survey.vertical' );
	if ( vertical ) {
		recordSelectedVertical( vertical );
	}
}

export default {
	[ SIGNUP_STEPS_SURVEY_SET ]: [ handleSignupStepsSurveyStart ]
};
