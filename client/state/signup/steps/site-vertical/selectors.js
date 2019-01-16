/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getSiteVerticalName( state ) {
	return get( state, 'signup.steps.siteVertical.name', '' );
}

export function getSiteVerticalSlug( state ) {
	return get( state, 'signup.steps.siteVertical.slug', '' );
}

export function getSiteVerticalIsUserInput( state ) {
	return get( state, 'signup.steps.siteVertical.isUserInput', true );
}

export function getSiteVerticalPreview( state ) {
	return get( state, 'signup.steps.siteVertical.preview', '' );
}
