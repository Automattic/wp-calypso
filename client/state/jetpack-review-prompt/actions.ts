/**
 * Internal dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { getExistingPreference } from './selectors';
import { PREFERENCE_NAME } from './constants';
import { savePreference } from 'calypso/state/preferences/actions';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismiss = ( type: 'restore' | 'scan', reviewed = false ) => ( dispatch, getState ) => {
	const state = getState();
	const fullPref = getPreference( state, PREFERENCE_NAME ) ?? {};
	const previousPref = getExistingPreference( state, type );

	return dispatch(
		savePreference( PREFERENCE_NAME, {
			...fullPref,
			[ type ]: {
				...previousPref,
				dismissCount: previousPref.dismissCount + ( reviewed ? 0 : 1 ),
				dismissedAt: Date.now(),
				reviewed,
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

export { dismiss, setValidFrom };
