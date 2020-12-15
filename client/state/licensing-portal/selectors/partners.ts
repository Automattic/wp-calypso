/**
 * External dependencies
 */
import find from 'lodash/find';
import flatMap from 'lodash/flatMap';

/**
 * Internal dependencies
 */
import { LicensingPortalStore } from 'calypso/state/licensing-portal';
// Required for modular state.
import 'calypso/state/licensing-portal/init';

export function getActivePartnerKeyId( state: LicensingPortalStore ) {
	return state.licensingPortal.partners.activePartnerKey;
}

export function getActivePartnerKey( state: LicensingPortalStore ) {
	const keyId = getActivePartnerKeyId( state );
	const partners = state.licensingPortal.partners.all;
	const partnerKeys = flatMap( partners, ( partner ) => partner.keys );
	const partnerKey = find( partnerKeys, ( key ) => key.id === keyId );

	return partnerKey;
}

export function hasActivePartnerKey( state: LicensingPortalStore ) {
	return !! getActivePartnerKey( state );
}

export function isFetchingPartners( state: LicensingPortalStore ) {
	return state.licensingPortal.partners.isFetching;
}

export function getAllPartners( state: LicensingPortalStore ) {
	return state.licensingPortal.partners.all;
}

export function getAllPartnersRequestError( state: LicensingPortalStore ) {
	return state.licensingPortal.partners.error;
}
