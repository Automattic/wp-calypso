import { get } from 'lodash';
import { getSurveyVertical } from 'calypso/state/signup/steps/survey/selectors';

import 'calypso/state/signup/init';

export function getSiteVerticalName( state ) {
	return get( state, 'signup.steps.siteVertical.name', '' );
}

export function getSiteVerticalId( state ) {
	return get( state, 'signup.steps.siteVertical.id', '' );
}

export function getSiteVerticalParentId( state ) {
	return get( state, 'signup.steps.siteVertical.parentId', '' );
}

export function getSiteVerticalSlug( state ) {
	return get( state, 'signup.steps.siteVertical.slug', '' );
}

export function getSiteVerticalIsUserInput( state ) {
	return get( state, 'signup.steps.siteVertical.isUserInput', true );
}

export function getSiteVerticalSuggestedTheme( state ) {
	return get( state, 'signup.steps.siteVertical.suggestedTheme' );
}

// Used to fill `vertical` param to pass to to `/domains/suggestions`
// client/signup/steps/domains/index.jsx
export function getVerticalForDomainSuggestions( state ) {
	return getSiteVerticalId( state ) || getSurveyVertical( state );
}
