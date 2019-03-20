/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { SITE_VERTICALS_REQUEST_ID, DEFAULT_SITE_VERTICAL_REQUEST_ID } from './constants';

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

export function getSiteVerticalPreview( state ) {
	return get( state, 'signup.steps.siteVertical.preview', '' );
}

export const isVerticalSearchPending = () =>
	'pending' === get( getHttpData( SITE_VERTICALS_REQUEST_ID ), 'state', false );

export const getSiteVerticalsLastUpdated = () => {
	const siteVerticalHttpData = getHttpData( SITE_VERTICALS_REQUEST_ID );

	return get( siteVerticalHttpData, 'lastUpdated', 0 );
};

export const getSiteVerticals = () => {
	const siteVerticalHttpData = getHttpData( SITE_VERTICALS_REQUEST_ID );

	return get( siteVerticalHttpData, 'data', [] );
};

export const getDefaultVertical = () => {
	const defaultVerticalHttpData = getHttpData( DEFAULT_SITE_VERTICAL_REQUEST_ID );
	return get( defaultVerticalHttpData, 'data[0]', {} );
};
