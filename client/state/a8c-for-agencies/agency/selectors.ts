// Required for modular state.
import 'calypso/state/a8c-for-agencies/init';
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

export function isAgencyClientUser( state: A4AStore ): boolean {
	return state.a8cForAgencies.agencies.isAgencyClientUser;
}
