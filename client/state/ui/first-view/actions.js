/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_DISMISS,
	FIRST_VIEW_SHOW,
} from 'state/action-types';

import {
	recordTracksEvent,
} from 'state/analytics/actions';

import {
	setPreference
} from 'state/preferences/actions';

import { FIRST_VIEW_START_DATES } from './constants';

export function init( { user } ) {
	const userCreated = moment( user.get().date );
	let eligibleViews = [];

	for ( var view in FIRST_VIEW_START_DATES ) {
		console.log( view, moment( FIRST_VIEW_START_DATES[ view ] ) );
		if ( moment( FIRST_VIEW_START_DATES[ view ] ).isBefore( userCreated ) ) {
			eligibleViews.push( view );
		}
	}

	return {
		type: FIRST_VIEW_SHOW,
		views: eligibleViews,
	}
}

export function showView( { views, force } ) {
	return {
		type: FIRST_VIEW_SHOW,
		views,
		force,
	};
}

export function dismissView( { view } ) {
	return dispatch => {
		dispatch( {
			type: FIRST_VIEW_DISMISS,
			view,
		} );
	};
}
