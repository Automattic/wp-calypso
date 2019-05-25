/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

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
export default function getSiteChecklistIsLoading( state, siteId ) {
	const isLoading = get( state.checklist, [ siteId, 'isLoading' ], false );
	const isLoadingDerived = getRequest( state, requestSiteChecklist( siteId ) ).isLoading;
	console.log( 'isLoading', isLoading, isLoadingDerived );
	return isLoading;
}
