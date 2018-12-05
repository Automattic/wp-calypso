/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice } from 'state/notices/actions';
import {
	createPagesError,
	fetchSetupStatusError,
	nextStep,
	updateSetupStatus,
} from '../../setup/actions';
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS,
	WP_JOB_MANAGER_SAVE_SETUP_STATUS,
} from '../../action-types';

let errorCount;
let successCount;
let totalPages;
const createPagesNotice = 'wpjm-create-pages';

/* Page Creation */
export const createPages = action => {
	const { siteId, titles } = action;

	errorCount = 0;
	successCount = 0;
	totalPages = titles.length;

	return [
		removeNotice( createPagesNotice ),
		...titles.map( title =>
			http(
				{
					method: 'POST',
					path: `/sites/${ siteId }/posts/new`,
					body: { type: 'page', title },
				},
				action
			)
		),
	];
};

export const announceFailure = siteId => [
	createPagesError( siteId ),
	errorNotice( translate( 'There was a problem creating the page(s). Please try again.' ), {
		id: createPagesNotice,
	} ),
];

export const areRequestsComplete = () => errorCount + successCount >= totalPages;

export const handleCreateSuccess = ( { siteId } ) => {
	successCount++;

	if ( ! areRequestsComplete() ) {
		return;
	}

	if ( errorCount !== 0 ) {
		return announceFailure( siteId );
	}

	return nextStep( siteId );
};

export const handleCreateFailure = ( { siteId } ) => {
	errorCount++;

	if ( ! areRequestsComplete() ) {
		return;
	}

	return announceFailure( siteId );
};

const dispatchCreatePagesRequest = dispatchRequestEx( {
	fetch: createPages,
	onSuccess: handleCreateSuccess,
	onError: handleCreateFailure,
} );

/* Setup Status */
export const fetchSetupStatus = action =>
	http(
		{
			method: 'GET',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: { path: '/wpjm/v1/status/run_page_setup' },
		},
		action
	);

export const handleSetupSuccess = ( { siteId }, { data } ) => updateSetupStatus( siteId, data );

export const handleSetupFailure = ( { siteId } ) => fetchSetupStatusError( siteId );

const dispatchFetchSetupStatusRequest = dispatchRequestEx( {
	fetch: fetchSetupStatus,
	onSuccess: handleSetupSuccess,
	onError: handleSetupFailure,
} );

export const saveSetupStatus = action =>
	http(
		{
			method: 'POST',
			path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
			query: {
				body: JSON.stringify( action.setupStatus ),
				json: true,
				path: '/wpjm/v1/status/run_page_setup',
			},
		},
		action
	);

const dispatchSaveSetupStatusRequest = dispatchRequestEx( {
	fetch: saveSetupStatus,
	onSuccess: noop,
	onError: noop,
} );

export default {
	[ WP_JOB_MANAGER_CREATE_PAGES ]: [ dispatchCreatePagesRequest ],
	[ WP_JOB_MANAGER_FETCH_SETUP_STATUS ]: [ dispatchFetchSetupStatusRequest ],
	[ WP_JOB_MANAGER_SAVE_SETUP_STATUS ]: [ dispatchSaveSetupStatusRequest ],
};
