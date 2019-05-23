/** @format */

/**
 * External dependencies
 */

import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteTypeId } from 'state/signup/steps/site-type/selectors';
import { getVerticals } from 'state/signup/verticals/selectors';

export function getSiteVerticalName( state ) {
	return get( state, 'signup.steps.siteVertical.name', '' );
}

export function getSiteVerticalData( state ) {
	const siteTypeId = getSiteTypeId( state );
	const verticalName = getSiteVerticalName( state );
	const verticals = getVerticals( state, verticalName, siteTypeId );

	const match = find(
		verticals,
		item => item.verticalName.toLowerCase() === verticalName.toLowerCase()
	);

	if ( match ) {
		return match;
	}

	return {
		isUserInputVertical: true,
		parent: '',
		preview: '',
		siteTypeId,
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
