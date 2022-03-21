import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { PREFERENCE_NAME, PreferenceType } from './constants';
import { getExistingPreference } from './selectors';
import type { CalypsoDispatch } from '../types';
import type { AppState } from 'calypso/types';

const combineDismissPreference = (
	state: AppState,
	type: 'restore' | 'scan',
	dismissedAt: number,
	reviewed: boolean
): PreferenceType => {
	const fullPref = getPreference( state, PREFERENCE_NAME ) ?? {};
	const previousPref = getExistingPreference( state, type );

	return {
		...fullPref,
		[ type ]: {
			...previousPref,
			dismissCount: previousPref.dismissCount + ( reviewed ? 0 : 1 ),
			dismissedAt,
			reviewed,
		},
	};
};

const dismiss = (
	type: 'restore' | 'scan',
	dismissedAt: number = Date.now(),
	reviewed = false
) => ( dispatch: CalypsoDispatch, getState: () => AppState ) =>
	dispatch(
		savePreference(
			PREFERENCE_NAME,
			combineDismissPreference( getState(), type, dismissedAt, reviewed )
		)
	);

const combineValidPreference = (
	state: AppState,
	type: 'restore' | 'scan',
	validFrom: number | null
): PreferenceType => {
	const fullPref = getPreference( state, PREFERENCE_NAME ) ?? {};
	const previousPref = getExistingPreference( state, type );

	return {
		...fullPref,
		[ type ]: {
			...previousPref,
			validFrom: validFrom ?? Date.now(),
		},
	};
};

const setValidFrom = ( type: 'restore' | 'scan', validFrom: number | null = null ) => (
	dispatch: CalypsoDispatch,
	getState: () => AppState
) =>
	dispatch(
		savePreference( PREFERENCE_NAME, combineValidPreference( getState(), type, validFrom ) )
	);
export { dismiss, setValidFrom, combineDismissPreference, combineValidPreference };
