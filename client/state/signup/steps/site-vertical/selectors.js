/** @format */

/**
 * External dependencies
 */

import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getVerticals } from 'state/signup/verticals/selectors';
import { DEFAULT_VERTICAL_KEY } from 'state/signup/verticals/constants';

export function getSiteVerticalName( state ) {
	return get( state, 'signup.steps.siteVertical.name', '' );
}

export function getSiteVerticalData( state ) {
	const verticalName = get( state, 'signup.steps.siteVertical.name', '' );

	const verticals = getVerticals( state, verticalName );

	const match = find(
		verticals,
		item => item.verticalName.toLowerCase() === verticalName.toLowerCase()
	);

	if ( match ) {
		return match;
	}

	const defaultVerticalData = get( verticals, [ DEFAULT_VERTICAL_KEY, 0 ], {} );

	return {
		isUserInputVertical: true,
		parent: '',
		preview: defaultVerticalData.preview || '',
		verticalId: '',
		verticalName,
		verticalSlug: verticalName,
	};
}

export function getSiteVerticalPreview( state ) {
	return get( getSiteVerticalData( state ), 'preview', '' );
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
