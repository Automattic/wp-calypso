import { USER_LICENSES_REQUEST, USER_LICENSES_COUNTS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
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
 * @param {object} action Redux action
 * @returns {object} original action
 */
export const requestLicenses = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses/user',
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
 * @param {object} action Redux action
 * @param {Object} licenses raw data from user licensing API
 * @returns {Array<object>} Redux actions
 */
export const receiveLicenses = ( action, licenses ) => [
	licensesRequestSuccessAction(),
	licensesReceiveAction( licenses ),
];

/**
 * Dispatches returned error from user licenses request
 *
 * @param {object} action Redux action
 * @param {object} rawError raw error from HTTP request
 * @returns {object} Redux action
 */
export const receiveLicensesError = ( action, rawError ) =>
	licensesRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

// -- License COUNTS handlers --
/**
 * Dispatches a request to fetch user licenses counts
 *
 * @param {object} action Redux action
 * @returns {object} original action
 */
export const requestCounts = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses/user/counts',
		},
		action
	);

/**
 * Dispatches returned user licenses counts data
 *
 * @param {object} action Redux action
 * @param {Object} counts raw count data from user licensing API
 * @returns {Array<object>} Redux actions
 */
export const receiveCounts = ( action, counts ) => [
	licensesCountsRequestSuccessAction(),
	licensesCountsReceiveAction( counts ),
];

/**
 * Dispatches returned error user license counts request
 *
 * @param {object} action Redux action
 * @param {object} rawError raw error from HTTP request
 * @returns {object} Redux action
 */
export const receiveCountsError = ( action, rawError ) =>
	licensesCountsRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

export const dispatchCountsRequest = dispatchRequest( {
	fetch: requestCounts,
	onSuccess: receiveCounts,
	onError: receiveCountsError,
} );

function formatLicenses( items ) {
	return items.map( ( item ) => ( {
		licenseId: item.license_id,
		licenseKey: item.license_key,
		product: item.product,
		productId: item.product_id,
		userId: item.user_id,
		username: item.username,
		blogId: item.blog_id,
		siteUrl: item.siteurl,
		issuedAt: item.issued_at,
		attachedAt: item.attached_at,
		revokedAt: item.revoked_at,
	} ) );
}

function formatPaginatedItems( itemFormatter, paginatedItems ) {
	return {
		currentItems: paginatedItems.current_items,
		currentPage: paginatedItems.current_page,
		items: itemFormatter( paginatedItems.items ),
		itemsPerPage: paginatedItems.items_per_page,
		totalItems: paginatedItems.total_items,
		totalPages: paginatedItems.total_pages,
	};
}

export const dispatchLicensesRequest = dispatchRequest( {
	fetch: requestLicenses,
	onSuccess: receiveLicenses,
	onError: receiveLicensesError,
	fromApi: ( paginatedItems ) => formatPaginatedItems( formatLicenses, paginatedItems ),
} );

registerHandlers( 'state/data-layer/wpcom/user-licensing', {
	[ USER_LICENSES_REQUEST ]: [ dispatchLicensesRequest ],
	[ USER_LICENSES_COUNTS_REQUEST ]: [ dispatchCountsRequest ],
} );
