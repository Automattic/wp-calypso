/**
 * External dependencies
 */
import find from 'lodash/find';
import flatMap from 'lodash/flatMap';

/**
 * Internal dependencies
 */
import { PartnerPortalStore } from 'calypso/state/partner-portal';
// Required for modular state.
import 'calypso/state/partner-portal/init';

export function getActivePartnerKeyId( state: PartnerPortalStore ) {
	return state.partnerPortal.partners.activePartnerKey;
}

export function getActivePartnerKey( state: PartnerPortalStore ) {
	const keyId = getActivePartnerKeyId( state );
	const partners = state.partnerPortal.partners.all;
	const partnerKeys = flatMap( partners, ( partner ) => partner.keys );
	const partnerKey = find( partnerKeys, ( key ) => key.id === keyId );

	return partnerKey;
}

export function hasActivePartnerKey( state: PartnerPortalStore ) {
	return !! getActivePartnerKey( state );
}

export function isFetchingPartners( state: PartnerPortalStore ) {
	return state.partnerPortal.partners.isFetching;
}

export function getAllPartners( state: PartnerPortalStore ) {
	return state.partnerPortal.partners.all;
}

export function getAllPartnersRequestError( state: PartnerPortalStore ) {
	return state.partnerPortal.partners.error;
}
