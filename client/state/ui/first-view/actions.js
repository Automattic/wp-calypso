/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_HIDE
} from 'state/action-types';

import {
	bumpStat,
	recordTracksEvent,
} from 'state/analytics/actions';

import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import { bucketedTimeSpentOnCurrentView } from './selectors';

export function hideView( { view, enabled } ) {
	const hideAction = {
		type: FIRST_VIEW_HIDE,
		view,
	};

	return ( dispatch, getState ) => {
		const timeBucket = bucketedTimeSpentOnCurrentView( getState() );

		const tracksEvent = recordTracksEvent( `calypso_first_view_dismissed`, {
			view,
			showAgain: enabled,
			timeSpent: timeBucket,
		} );


		dispatch( bumpStat( 'calypso_first_view_dismissed', enabled ? 'show_again' : 'dont_show' ) );
		dispatch( bumpStat( 'calypso_first_view_duration', timeBucket ) );
		dispatch( tracksEvent );
		dispatch( hideAction );
		dispatch( persistToPreferences( { getState, view, disabled: ! enabled } ) );
	};
}

function persistToPreferences( { getState, view, disabled } ) {
	return savePreference( 'firstViewHistory', [
		...getPreference( getState(), 'firstViewHistory' ).filter( item => item.view !== view ), {
			view,
			timestamp: Date.now(),
			disabled,
		}
	] );
}
