import { savePreference } from 'calypso/state/preferences/actions';
import { PREFERENCE_BASE_NAME } from './constants';
import { incrementPreference } from './helpers';
import { lastUpdatedIsToday } from './selectors';
import type { CalypsoDispatch } from '../types';
import type { AppState } from 'calypso/types';

export const incrementCounter =
	( counterName: string, keyedToSiteId = false, countSameDay = true ) =>
	( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		if ( ! countSameDay && lastUpdatedIsToday( getState(), counterName, keyedToSiteId ) ) {
			return;
		}

		return dispatch(
			savePreference(
				PREFERENCE_BASE_NAME,
				incrementPreference( getState(), counterName, keyedToSiteId )
			)
		);
	};
