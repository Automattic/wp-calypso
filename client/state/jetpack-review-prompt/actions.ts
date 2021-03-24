/**
 * Internal dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { getExistingPreference } from './selectors';
import { PREFERENCE_NAME } from './constants';
import { savePreference } from 'calypso/state/preferences/actions';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismiss = ( type: 'restore' | 'scan' ) => ( dispatch, getState ) => {
	const state = getState();
	const fullPref = getPreference( state, PREFERENCE_NAME ) ?? {};
	const previousPref = getExistingPreference( state, type );

	return dispatch(
		savePreference( PREFERENCE_NAME, {
			...fullPref,
			[ type ]: {
				...previousPref,
				dismissCount: previousPref.dismissCount + 1,
				dismissedAt: Date.now(),
			},
		} )
	);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismissAsReviewed = ( type: 'restore' | 'scan' ) => ( dispatch, getState ) => {
	const state = getState();
	const fullPref = getPreference( state, PREFERENCE_NAME ) ?? {};
	const previousPref = getExistingPreference( state, type );

	return dispatch(
		savePreference( PREFERENCE_NAME, {
			...fullPref,
			[ type ]: {
				...previousPref,
				dismissedAt: Date.now(),
				reviewed: true,
			},
		} )
	);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const setValidFrom = ( type: 'restore' | 'scan', validFrom: number | null = null ) => (
	dispatch,
	getState
) => {
	const state = getState();
	const fullPref = getPreference( state, PREFERENCE_NAME ) ?? {};
	const previousPref = getExistingPreference( state, type );

	return dispatch(
		savePreference( PREFERENCE_NAME, {
			...fullPref,
			[ type ]: {
				...previousPref,
				validFrom: validFrom ?? Date.now(),
			},
		} )
	);
};

export { dismiss, dismissAsReviewed, setValidFrom };
