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
	JETPACK_CREDENTIALS_STORE
} from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';

export const request = ( { dispatch }, action ) => {
	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/activity-log/${ action.siteId }/update-credentials`,
		body: { credentials: action.credentials },
		onSuccess: action,
		onFailure: action
	} ) );

	dispatch( successNotice( i18n.translate( 'Testing connection…' ), { duration: 4000 } ) );
};

export const success = ( { dispatch }, action ) => {
	const credentials = {
		credentials: {
			main: action.credentials
		}
	};

	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_SUCCESS
	} );

	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: credentials
	} );

	dispatch( successNotice( i18n.translate( 'Your site is now connected.' ), { duration: 4000 } ) );
};

export const failure = ( { dispatch }, action, error ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
		error
	} );

	dispatch( errorNotice( i18n.translate( 'Error saving. Please check your credentials and try again.' ), { duration: 4000 } ) );
};

export default {
	[ JETPACK_CREDENTIALS_UPDATE ]: [ dispatchRequest( request, success, failure ) ],
};
