/**
 * Internal dependencies
 */
import 'calypso/state/licensing-portal/init';

export function getInspectedLicenseKey( state ) {
	return state.licensingPortal.inspectLicense.licenseKey;
}

export function isInspecting( state ) {
	return state.licensingPortal.inspectLicense.isInspecting;
}

export function getInspectionResult( state ) {
	return state.licensingPortal.inspectLicense.result;
}

export function getInspectionError( state ) {
	return state.licensingPortal.inspectLicense.error;
}

// TODO remove this once we have an auth token API for licensing.
export function getInspectedLicenseAuthToken( state ) {
	return state.licensingPortal.inspectLicense.authToken;
}
