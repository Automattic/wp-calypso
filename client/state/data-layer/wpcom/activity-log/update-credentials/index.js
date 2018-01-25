/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
	JETPACK_CREDENTIALS_STORE,
	REWIND_STATE_UPDATE,
} from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

export const request = ( { dispatch }, action ) => {
	const notice = successNotice( i18n.translate( 'Testing connection…' ), { duration: 4000 } );
	const { notice: { noticeId } } = notice;

	dispatch( notice );

	const { path, ...otherCredentials } = action.credentials;
	const credentials = { ...otherCredentials, abspath: path };

	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/update-credentials`,
				body: { credentials },
			},
			{ ...action, noticeId }
		)
	);
};

export const success = ( { dispatch }, action, { rewind_state } ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_SUCCESS,
		siteId: action.siteId,
	} );

	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: action.credentials,
		},
		siteId: action.siteId,
	} );

	dispatch(
		successNotice( i18n.translate( 'Your site is now connected.' ), {
			duration: 4000,
			id: action.noticeId,
		} )
	);

	// the API transform could fail and the rewind data might
	// be unavailable so if that's the case just let it go
	// for now. we'll improve our rigor as time goes by.
	try {
		dispatch( {
			type: REWIND_STATE_UPDATE,
			siteId: action.siteId,
			data: transformApi( rewind_state ),
		} );
	} catch ( e ) {}
};

export const failure = ( { dispatch }, action, error ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
		error,
		siteId: action.siteId,
	} );

	dispatch(
		errorNotice( i18n.translate( 'Error saving. Please check your credentials and try again.' ), {
			duration: 4000,
			id: action.noticeId,
		} )
	);
};

export default {
	[ JETPACK_CREDENTIALS_UPDATE ]: [ dispatchRequest( request, success, failure ) ],
};
