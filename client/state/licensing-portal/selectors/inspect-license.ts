/**
 * Internal dependencies
 */
import { LicensingPortalStore } from 'calypso/state/licensing-portal';
// Required for modular state.
import 'calypso/state/licensing-portal/init';

export function getInspectedLicenseKey( state: LicensingPortalStore ) {
	return state.licensingPortal.inspectLicense.licenseKey;
}

export function isInspecting( state: LicensingPortalStore ) {
	return state.licensingPortal.inspectLicense.isInspecting;
}

export function getInspectionResult( state: LicensingPortalStore ) {
	return state.licensingPortal.inspectLicense.result;
}

export function getInspectionError( state: LicensingPortalStore ) {
	return state.licensingPortal.inspectLicense.error;
}
