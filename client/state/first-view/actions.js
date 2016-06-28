/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_EMBRACE,
	FIRST_VIEW_DISMISS,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
} from 'state/action-types';

import { FIRST_VIEW_START_DATES } from './constants';

export function init( { user } ) {
	const userCreated = moment( user.get().date );
	let eligibleViews = [];

	for ( let view in FIRST_VIEW_START_DATES ) {
		if ( moment( FIRST_VIEW_START_DATES[ view ] ).isBefore( userCreated ) ) {
			eligibleViews.push( view );
		}
	}

	return {
		type: FIRST_VIEW_SHOW,
		views: eligibleViews,
	};
}

export function dismissView( { view } ) {
	return {
		type: FIRST_VIEW_DISMISS,
		view,
	};
}

export function embraceView( { view } ) {
	return {
		type: FIRST_VIEW_EMBRACE,
		view,
	};
}

export function hideViews( { views } ) {
	return {
		type: FIRST_VIEW_HIDE,
		views
	};
}

export function showViews( { views, force } ) {
	return {
		type: FIRST_VIEW_SHOW,
		views,
		force,
	};
}
