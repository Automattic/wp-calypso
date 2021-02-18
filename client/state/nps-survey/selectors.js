/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { NOT_SUBMITTED, SUBMITTING, SUBMIT_FAILURE, SUBMITTED } from './constants';
import { getSectionName } from 'calypso/state/ui/selectors';

import 'calypso/state/nps-survey/init';

const ALLOWED_SECTION_NAMES = [
	'discover',
	'menus',
	'people',
	'plugins',
	'posts',
	'pages',
	'reader',
	'reader-activities',
	'reader-list',
	'reader-recommendations',
	'reader-tags',
	'settings',
	'sharing',
	'stats',
];

export function isSessionEligibleForNpsSurvey( state ) {
	return get( state.npsSurvey, 'isSessionEligible', false );
}

export function isSectionEligibleForNpsSurvey( state ) {
	const sectionName = getSectionName( state );
	return ALLOWED_SECTION_NAMES.indexOf( sectionName ) > -1;
}

export function isSectionAndSessionEligibleForNpsSurvey( state ) {
	return isSectionEligibleForNpsSurvey( state ) && isSessionEligibleForNpsSurvey( state );
}

export function wasNpsSurveyShownThisSession( state ) {
	return get( state.npsSurvey, 'wasShownThisSession', false );
}

function getNpsSurveyState( state ) {
	return get( state.npsSurvey, 'surveyState', NOT_SUBMITTED );
}

export function isNpsSurveyNotSubmitted( state ) {
	return getNpsSurveyState( state ) === NOT_SUBMITTED;
}

export function isNpsSurveySubmitting( state ) {
	return getNpsSurveyState( state ) === SUBMITTING;
}

export function isNpsSurveySubmitted( state ) {
	return getNpsSurveyState( state ) === SUBMITTED;
}

export function isNpsSurveySubmitFailure( state ) {
	return getNpsSurveyState( state ) === SUBMIT_FAILURE;
}

export function getNpsSurveyName( state ) {
	return get( state.npsSurvey, 'surveyName', null );
}

export function getNpsSurveyScore( state ) {
	return get( state.npsSurvey, 'score', null );
}

export function getNpsSurveyFeedback( state ) {
	return get( state.npsSurvey, 'feedback', null );
}

export function hasAnsweredNpsSurvey( state ) {
	return ! isNpsSurveyNotSubmitted( state ) && Number.isInteger( getNpsSurveyScore( state ) );
}

export function hasAnsweredNpsSurveyWithNoScore( state ) {
	return ! isNpsSurveyNotSubmitted( state ) && ! Number.isInteger( getNpsSurveyScore( state ) );
}

export function isAvailableForConciergeSession( state ) {
	return get( state.npsSurvey, 'isAvailableForConciergeSession', false );
}
