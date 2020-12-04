/**
 * External dependencies
 */
import find from 'lodash/find';
import flatMap from 'lodash/flatMap';

// Required for modular state.
import 'calypso/state/licensing-portal/init';

export function getActivePartnerKeyId( state ) {
	return state.licensingPortal.partners.activePartnerKey;
}

export function getActivePartnerKey( state ) {
	const keyId = getActivePartnerKeyId( state );
	const partners = state.licensingPortal.partners.all;
	const partnerKeys = flatMap( partners, ( partner ) => partner.keys );
	const partnerKey = find( partnerKeys, ( key ) => key.id === keyId );

	return partnerKey;
}

export function hasActivePartnerKey( state ) {
	return !! getActivePartnerKey( state );
}

export function isFetchingPartners( state ) {
	return state.licensingPortal.partners.isFetching;
}

export function getAllPartners( state ) {
	return state.licensingPortal.partners.all;
}

export function getAllPartnersRequestError( state ) {
	return state.licensingPortal.partners.error;
}
