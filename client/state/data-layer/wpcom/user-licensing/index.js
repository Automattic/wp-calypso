import { USER_LICENSES_REQUEST, USER_LICENSES_COUNTS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { convertToCamelCase } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	licensesReceiveAction,
	licensesRequestFailureAction,
	licensesRequestSuccessAction,
	licensesCountsReceiveAction,
	licensesCountsRequestFailureAction,
	licensesCountsRequestSuccessAction,
} from 'calypso/state/user-licensing/actions';

/**
 * @module state/data-layer/wpcom/user-licensing
 */

// -- LICENSES handlers --
/**
 * Dispatches a request to fetch user licenses
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const requestLicenses = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/user/licenses',
			query: {
				// Do not apply filters during search as search takes over (matches Calypso Blue Post search behavior).
				...( action.search
					? { search: action.search }
					: { filter: action.filter, page: action.page } ),
				sort_field: action.sortField,
				sort_direction: action.sortDirection,
				per_page: action.perPage,
			},
		},
		action
	);

/**
 * Dispatches returned user licenses data
 *
 * @param {Object} action Redux action
 * @param {Object} licenses raw data from user licensing API
 * @returns {Array<Object>} Redux actions
 */
export const receiveLicenses = ( action, licenses ) => [
	licensesRequestSuccessAction(),
	licensesReceiveAction( licenses ),
];

/**
 * Dispatches returned error from user licenses request
 *
 * @param {Object} action Redux action
 * @param {Object} rawError raw error from HTTP request
 * @returns {Object} Redux action
 */
export const receiveLicensesError = ( action, rawError ) =>
	licensesRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

// -- License COUNTS handlers --
/**
 * Dispatches a request to fetch user licenses counts
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const requestCounts = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/user/licenses/counts',
		},
		action
	);

/**
 * Dispatches returned user licenses counts data
 *
 * @param {Object} action Redux action
 * @param {Object} counts raw count data from user licensing API
 * @returns {Array<Object>} Redux actions
 */
export const receiveCounts = ( action, counts ) => [
	licensesCountsRequestSuccessAction(),
	licensesCountsReceiveAction( counts ),
];

/**
 * Dispatches returned error user license counts request
 *
 * @param {Object} action Redux action
 * @param {Object} rawError raw error from HTTP request
 * @returns {Object} Redux action
 */
export const receiveCountsError = ( action, rawError ) =>
	licensesCountsRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

export const dispatchCountsRequest = dispatchRequest( {
	fetch: requestCounts,
	onSuccess: receiveCounts,
	onError: receiveCountsError,
} );

export const dispatchLicensesRequest = dispatchRequest( {
	fetch: requestLicenses,
	onSuccess: receiveLicenses,
	onError: receiveLicensesError,
	fromApi: ( paginatedItems ) => convertToCamelCase( paginatedItems ),
} );

registerHandlers( 'state/data-layer/wpcom/user-licensing', {
	[ USER_LICENSES_REQUEST ]: [ dispatchLicensesRequest ],
	[ USER_LICENSES_COUNTS_REQUEST ]: [ dispatchCountsRequest ],
} );
