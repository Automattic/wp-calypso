import find from 'lodash/find';
import type {
	APIError,
	Partner,
	PartnerKey,
	PartnerPortalStore,
} from 'calypso/state/partner-portal/types';
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

export function hasFetchedPartner( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.partner.hasFetched;
}

export function isFetchingPartner( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.partner.isFetching;
}

export function getCurrentPartner( state: PartnerPortalStore ): Partner | null {
	return state.partnerPortal.partner.current;
}

export function getPartnerRequestError( state: PartnerPortalStore ): APIError | null {
	return state.partnerPortal.partner.error;
}
