import { get } from 'lodash';
import type { RequestStatus } from 'calypso/state/sites/intro-offers/types';
import type { AppState } from 'calypso/types';

/**
 * Returns the status of the request and null if there has yet to be a request.
 * False otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {string}             The request status or null if there has been no request
 */
export default function getIntroOfferRequestStatus(
	state: AppState,
	siteId?: number
): RequestStatus | null {
	return get( state.sites.introOffers, `${ siteId ?? 'none' }.requestStatus`, null );
}
