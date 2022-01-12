import getIntroOfferRequestStatus from 'calypso/state/selectors/get-intro-offers-request-status';
import { RequestStatus } from 'calypso/state/sites/intro-offers/types';
import type { AppState } from 'calypso/types';
/**
 * Returns the status of the request and null if there has yet to be a request.
 * False otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number?}  siteId      The ID of the site we're querying
 * @returns {string}             The request status or null if there has been no request
 */
export default function getIsIntroOfferRequesting( state: AppState, siteId?: number ): boolean {
	return getIntroOfferRequestStatus( state, siteId ) === RequestStatus.Pending;
}
