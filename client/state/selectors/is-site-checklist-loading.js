import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import getRequest from 'calypso/state/selectors/get-request';

/**
 * Returns the loading state for the checklist API call
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}    Whether the checklist is loading
 */
export default function isSiteChecklistLoading( state, siteId ) {
	return getRequest( state, requestSiteChecklist( siteId ) ).isLoading;
}
