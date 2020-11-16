/**
 * Internal dependencies
 */
import { initialState } from 'calypso/state/jetpack-licensing/reducer/inspect-license';

export function getInspectedLicenseKey( state ) {
	console.log( state, initialState );
	return state.jetpackLicensing
		? state.jetpackLicensing.inspectLicense.licenseKey
		: initialState.licenseKey;
}

export function isInspecting( state ) {
	return state.jetpackLicensing
		? state.jetpackLicensing.inspectLicense.isInspecting
		: initialState.isInspecting;
}

export function getInspectionResult( state ) {
	return state.jetpackLicensing
		? state.jetpackLicensing.inspectLicense.result
		: initialState.result;
}
