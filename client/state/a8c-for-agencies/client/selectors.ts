// Required for modular state.
import 'calypso/state/a8c-for-agencies/init';
import { A4AStore, APIError } from '../types';

export function hasFetchedClient( state: A4AStore ): boolean {
	return state.a8cForAgencies.client.hasFetched;
}

export function isFetchingClient( state: A4AStore ): boolean {
	return state.a8cForAgencies.client.isFetching;
}

export function getClient( state: A4AStore ) {
	return state.a8cForAgencies.client.client;
}

export function getClientRequestError( state: A4AStore ): APIError | null {
	return state.a8cForAgencies.client.error;
}
