/**
 * Internal dependencies
 */
import 'calypso/state/licensing-portal/init';

export function getInspectedLicenseKey( state ) {
	return state.jetpackLicensing.inspectLicense.licenseKey;
}

export function isInspecting( state ) {
	return state.jetpackLicensing.inspectLicense.isInspecting;
}

export function getInspectionResult( state ) {
	return state.jetpackLicensing.inspectLicense.result;
}

export function getInspectionError( state ) {
	return state.jetpackLicensing.inspectLicense.error;
}

// TODO remove this once we have an auth token API for licensing.
export function getInspectedLicenseAuthToken( state ) {
	return state.jetpackLicensing.inspectLicense.authToken;
}
