/**
 * External dependencies
 */
import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getVerticals } from 'state/signup/verticals/selectors';
import { getSurveyVertical } from 'state/signup/steps/survey/selectors';

import 'state/signup/init';

export function getSiteVerticalName( state ) {
	return get( state, 'signup.steps.siteVertical.name', '' );
}

export function getSiteVerticalData( state ) {
	const siteType = getSiteType( state );
	const verticalName = getSiteVerticalName( state );
	const verticals = getVerticals( state, verticalName, siteType );

	const match = find(
		verticals,
		( item ) => item.verticalName.toLowerCase() === verticalName.toLowerCase()
	);

	if ( match ) {
		return match;
	}

	return {
		isUserInputVertical: true,
		parent: '',
		preview: '',
		previewStylesUrl: '',
		siteType,
		verticalId: '',
		verticalName,
		verticalSlug: verticalName,
	};
}

export function getSiteVerticalPreview( state ) {
	return get( getSiteVerticalData( state ), 'preview', '' );
}

export function getSiteVerticalPreviewScreenshot( state, viewportDevice ) {
	const screenshots = get( getSiteVerticalData( state ), 'previewScreenshots' );

	return get(
		screenshots,
		viewportDevice,
		get( screenshots, viewportDevice === 'phone' ? 'phoneHighDpi' : 'desktopHighDpi' )
	);
}

export function getSiteVerticalPreviewStyles( state ) {
	return get( getSiteVerticalData( state ), 'previewStylesUrl', '' );
}

// TODO: All the following selectors will be updated to use getSiteVerticalData like getSiteVerticalPreview() does.
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
