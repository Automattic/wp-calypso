/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { createPagesError, nextStep } from '../../setup/actions';
import { WP_JOB_MANAGER_CREATE_PAGES } from '../../action-types';

let errorCount;
let successCount;
let totalPages;
const createPagesNotice = 'wpjm-create-pages';

export const createPages = ( { dispatch }, action ) => {
	const { siteId, titles } = action;

	errorCount = 0;
	successCount = 0;
	totalPages = titles.length;

	dispatch( removeNotice( createPagesNotice ) );

	titles.forEach( title => {
		dispatch( http( {
			method: 'POST',
			path: `/sites/${ siteId }/posts/new`,
			body: {
				title,
				type: 'page',
			}
		}, action ) );
	} );
};

export const announceFailure = ( dispatch, siteId ) => {
	dispatch( createPagesError( siteId ) );
	dispatch( errorNotice(
		translate( 'There was a problem creating the page(s). Please try again.' ),
		{ id: createPagesNotice }
	) );
};

export const areRequestsComplete = () => {
	if ( errorCount + successCount >= totalPages ) {
		return true;
	}

	return false;
};

export const handleSuccess = ( { dispatch }, { siteId } ) => {
	successCount++;

	if ( ! areRequestsComplete() ) {
		return;
	}

	if ( errorCount !== 0 ) {
		announceFailure( dispatch, siteId );
		return;
	}

	dispatch( nextStep( siteId ) );
};

export const handleFailure = ( { dispatch }, { siteId } ) => {
	errorCount++;

	if ( ! areRequestsComplete() ) {
		return;
	}

	announceFailure( dispatch, siteId );
};

const dispatchCreatePagesRequest = dispatchRequest( createPages, handleSuccess, handleFailure );

export default {
	[ WP_JOB_MANAGER_CREATE_PAGES ]: [ dispatchCreatePagesRequest ],
};
