// Required for modular state.
import 'calypso/state/a8c-for-agencies/init';
import { isEnabled } from '@automattic/calypso-config';
import { A4AStore, APIError, Agency } from '../types';

export function getActiveAgency( state: A4AStore ): Agency | null {
	return state.a8cForAgencies.agencies.activeAgency;
}

export function getActiveAgencyId( state: A4AStore ): number | undefined {
	return state.a8cForAgencies.agencies.activeAgency?.id;
}

export function hasActiveAgencyKey( state: A4AStore ): boolean {
	return !! getActiveAgencyId( state );
}

export function hasFetchedAgency( state: A4AStore ): boolean {
	return state.a8cForAgencies.agencies.hasFetched;
}

export function isFetchingAgency( state: A4AStore ): boolean {
	return state.a8cForAgencies.agencies.isFetching;
}

export function getAgencyRequestError( state: A4AStore ): APIError | null {
	return state.a8cForAgencies.agencies.error;
}

export function hasAgency( state: A4AStore ): boolean {
	const agencies = state.a8cForAgencies.agencies.agencies;
	return Array.isArray( agencies ) && agencies.length > 0;
}

export function isAgencyOwner( state: A4AStore ): boolean {
	return getActiveAgency( state )?.user?.role === 'a4a_administrator';
}

export function isAgencyClientUser( state: A4AStore ): boolean {
	return state.a8cForAgencies.agencies.isAgencyClientUser;
}

export function hasAgencyCapability( state: A4AStore, capability: string ): boolean {
	if ( ! isEnabled( 'a4a-multi-user-support' ) ) {
		// This is always true if the feature is not enabled to bypass restrictions.
		return true;
	}

	const agency = getActiveAgency( state );
	return agency?.user?.capabilities?.includes( capability ) ?? false;
}
