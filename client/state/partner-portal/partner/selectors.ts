import find from 'lodash/find';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type {
	APIError,
	Partner,
	PartnerKey,
	PartnerPortalStore,
} from 'calypso/state/partner-portal/types';
// Required for modular state.
import 'calypso/state/partner-portal/init';
import type { IAppState } from 'calypso/state/types';

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

export function getIsPartnerOAuthTokenLoaded( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.partner.isPartnerOAuthTokenLoaded;
}

export function getCurrentPartner( state: PartnerPortalStore ): Partner | null {
	return state.partnerPortal?.partner.current || null;
}

export function getPartnerRequestError( state: PartnerPortalStore ): APIError | null {
	return state.partnerPortal.partner.error;
}

export function hasJetpackPartnerAccess( state: PartnerPortalStore ): boolean {
	const currentUser = getCurrentUser( state );
	return currentUser?.has_jetpack_partner_access ?? false;
}

export function isAgencyUser( state: PartnerPortalStore | IAppState ): boolean {
	const currentUser = getCurrentUser( state );
	return currentUser?.jetpack_partner_types?.includes( 'agency' ) ?? false;
}

export function isA4AUser( state: PartnerPortalStore | IAppState ): boolean {
	const currentUser = getCurrentUser( state );
	return currentUser?.jetpack_partner_types?.includes( 'a4a_agency' ) ?? false;
}

export function showAgencyDashboard( state: PartnerPortalStore ): boolean {
	return isAgencyUser( state );
}

export function hasValidPaymentMethod( state: PartnerPortalStore ): boolean {
	const partner = getCurrentPartner( state );
	return partner?.has_valid_payment_method || false;
}

export function doesPartnerRequireAPaymentMethod( state: PartnerPortalStore ): boolean {
	const isAgency = isAgencyUser( state );
	const hasPaymentMethod = hasValidPaymentMethod( state );

	return isAgency && ! hasPaymentMethod;
}
