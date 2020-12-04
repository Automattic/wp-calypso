/**
 * Internal dependencies
 */
// Required for modular state.
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
