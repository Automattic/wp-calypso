import { get } from 'lodash';
import type { RequestStatus } from 'calypso/state/sites/intro-offers/reducers';
import type { AppState } from 'calypso/types';

/**
 * Returns true if we are currently performing a request to fetch the site credentials.
 * False otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether credentials are currently being requested for that site.
 */
export default function getIntroOfferRequestStatus(
	state: AppState,
	siteId: number
): RequestStatus | null {
	return get( state.sites.introOffers, `${ siteId }.requestStatus`, null );
}
