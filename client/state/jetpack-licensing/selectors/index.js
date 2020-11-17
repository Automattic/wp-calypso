/**
 * Internal dependencies
 */
import 'calypso/state/jetpack-licensing/init';

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
