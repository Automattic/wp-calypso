/**
 * External dependencies
 *
 * @format
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_CREDENTIALS_DELETE, JETPACK_CREDENTIALS_STORE } from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';

export const request = ( { dispatch }, action ) => {
	const notice = successNotice( i18n.translate( 'Deleting credentials…' ), { duration: 4000 } );
	const { notice: { noticeId } } = notice;

	dispatch( notice );

	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/delete-credentials`,
				body: { role: action.role },
			},
			{ ...action, noticeId }
		)
	);
};

export const success = ( { dispatch }, action ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: null,
		},
		siteId: action.siteId,
	} );

	dispatch(
		successNotice( i18n.translate( 'Your credentials have been deleted.' ), {
			duration: 4000,
			id: action.noticeId,
		} )
	);
};

export const failure = ( { dispatch }, action ) => {
	dispatch(
		errorNotice( i18n.translate( 'Error deleting credentials. Please try again.' ), {
			duration: 4000,
			id: action.noticeId,
		} )
	);
};

export default {
	[ JETPACK_CREDENTIALS_DELETE ]: [ dispatchRequest( request, success, failure ) ],
};
