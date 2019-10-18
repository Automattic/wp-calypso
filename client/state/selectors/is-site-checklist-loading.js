/**
 * Internal dependencies
 */
import getRequest from 'state/selectors/get-request';
import { requestSiteChecklist } from 'state/checklist/actions';

/**
 * Returns the loading state for the checklist API call
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Bool}    Whether the checklist is loading
 */
export default function isSiteChecklistLoading( state, siteId ) {
	return getRequest( state, requestSiteChecklist( siteId ) ).isLoading;
}
