import getIntroOfferRequestStatus from 'calypso/state/selectors/get-intro-offers-request-status';
import { RequestStatus } from 'calypso/state/sites/intro-offers/types';
import type { AppState } from 'calypso/types';

/**
 * Returns true if a request for intro offers is in-progress, false otherwise.
 *
 * @param  {Object}   state     Global state tree
 * @param  {number?}  siteId    The ID of the site we're querying
 * @returns {string}            true if request is in-progress, false otherwise
 */
export default function getIsIntroOfferRequesting(
	state: AppState,
	siteId?: number | 'none'
): boolean {
	return getIntroOfferRequestStatus( state, siteId ) === RequestStatus.Pending;
}
