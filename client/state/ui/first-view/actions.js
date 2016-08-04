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
import { bucketedTimeSpentOnCurrentView, getConfigForCurrentView } from './selectors';

export function hideView( { enabled } ) {
	return ( dispatch, getState ) => {
		const timeBucket = bucketedTimeSpentOnCurrentView( getState() );
		const config = getConfigForCurrentView( getState() );

		const hideAction = {
			type: FIRST_VIEW_HIDE,
			view: config.name,
		};

		const tracksEvent = recordTracksEvent( `calypso_first_view_dismissed`, {
			view: config.name,
			showAgain: enabled,
			timeSpent: timeBucket,
		} );


		dispatch( bumpStat( 'calypso_first_view_dismissed', enabled ? 'show_again' : 'dont_show' ) );
		dispatch( bumpStat( 'calypso_first_view_duration', timeBucket ) );
		dispatch( tracksEvent );
		dispatch( hideAction );
		dispatch( persistToPreferences( { getState, view: config.name, disabled: ! enabled } ) );
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
