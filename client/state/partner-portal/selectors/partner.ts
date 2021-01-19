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
	return state.partnerPortal.partner.activePartnerKey;
}

export function getActivePartnerKey( state: PartnerPortalStore ) {
	const partner = getCurrentPartner( state );

	if ( ! partner ) {
		return null;
	}

	const keyId = getActivePartnerKeyId( state );
	const partnerKey = find( partner.keys, ( key ) => key.id === keyId );

	return partnerKey;
}

export function hasActivePartnerKey( state: PartnerPortalStore ) {
	return !! getActivePartnerKey( state );
}

export function isFetchingPartner( state: PartnerPortalStore ) {
	return state.partnerPortal.partner.isFetching;
}

export function getCurrentPartner( state: PartnerPortalStore ) {
	return state.partnerPortal.partner.current;
}

export function getPartnerRequestError( state: PartnerPortalStore ) {
	return state.partnerPortal.partner.error;
}
