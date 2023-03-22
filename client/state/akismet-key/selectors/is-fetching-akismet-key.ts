import type { AppState } from 'calypso/types';

/**
 * Is there a pending request for the users Akismet API key?
 *
 * @param state
 * @returns null | boolean
 */
export default function isFetchingAkismetKey( state: AppState ) {
	return state.akismetKey?.isFetching ?? null;
}
