/**
 * External dependencies
 */
import intersection from 'lodash/intersection';

/**
 * Internal dependencies
 */
import { fetchPreferences, savePreference } from 'state/preferences/actions';
import { fetchingPreferences, getPreference } from 'state/preferences/selectors';
import { getDisabledViews } from './selectors';
import moment from 'moment';

import {
	FIRST_VIEW_DISABLE,
	FIRST_VIEW_DISABLED_SET,
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
	FIRST_VIEW_VISIBLE_SET,
} from 'state/action-types';

import { FIRST_VIEW_START_DATES } from './constants';

const FIRST_VIEW_DISABLED_PREFERENCES_KEY = 'firstViewDisabledViews';

export function init( { reduxStore, user } ) {
	const userCreated = moment( user.get().date );
	let visibleViews = [];

	for ( let view in FIRST_VIEW_START_DATES ) {
		if ( moment( FIRST_VIEW_START_DATES[ view ] ).isBefore( userCreated ) ) {
			visibleViews.push( view );
		}
	}

	return ( dispatch, getState ) => {
		let currentDisabledViews,
			fetched = false;

		dispatch( fetchPreferences() );

		function handleDisabledViewsChange() {
			const state = getState();

			let previousDisabledViews = currentDisabledViews;
			currentDisabledViews = getDisabledViews( state );

			if ( ! fetched ) {
				if ( ! fetchingPreferences( state ) ) {
					fetched = true;
					dispatch( {
						type: FIRST_VIEW_DISABLED_SET,
						views: getPreference( state, FIRST_VIEW_DISABLED_PREFERENCES_KEY ),
					} );
				}
			} else {
				if (
					previousDisabledViews.length !== currentDisabledViews.length ||
					intersection( previousDisabledViews, currentDisabledViews ).length !== currentDisabledViews.length
				) {
					dispatch( savePreference( FIRST_VIEW_DISABLED_PREFERENCES_KEY, currentDisabledViews ) );
				}
			}
		}

		reduxStore.subscribe( handleDisabledViewsChange );

		dispatch( {
			type: FIRST_VIEW_VISIBLE_SET,
			views: visibleViews,
		} );
	};
}

export function disableView( { view } ) {
	return dispatch => {
		dispatch( {
			type: FIRST_VIEW_DISABLE,
			view,
		} );
	};
}

export function enableView( { view } ) {
	return dispatch => {
		dispatch( {
			type: FIRST_VIEW_ENABLE,
			view,
		} );
	};
}

export function hideView( { view } ) {
	return dispatch => {
		dispatch( {
			type: FIRST_VIEW_HIDE,
			view,
		} );
	};
}

export function showView( { view } ) {
	return dispatch => {
		dispatch( {
			type: FIRST_VIEW_SHOW,
			view,
		} );
	};
}
