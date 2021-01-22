/**
 * External dependencies
 */
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import { Partner, PartnerKey, PartnerPortalStore } from 'calypso/state/partner-portal';
// Required for modular state.
import 'calypso/state/partner-portal/init';

export function getActivePartnerKeyId( state: PartnerPortalStore ): number {
	return state.partnerPortal.partner.activePartnerKey;
}

export function getActivePartnerKey( state: PartnerPortalStore ): PartnerKey | null {
	const partner = getCurrentPartner( state );

	if ( ! partner ) {
		return null;
	}

	const keyId = getActivePartnerKeyId( state );
	const partnerKey = find( partner.keys, ( key ) => key.id === keyId ) || null;

	return partnerKey;
}

export function hasActivePartnerKey( state: PartnerPortalStore ): boolean {
	return !! getActivePartnerKey( state );
}

export function isFetchingPartner( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.partner.isFetching;
}

export function getCurrentPartner( state: PartnerPortalStore ): Partner | null {
	return state.partnerPortal.partner.current;
}

export function getPartnerRequestError( state: PartnerPortalStore ): string {
	return state.partnerPortal.partner.error;
}
