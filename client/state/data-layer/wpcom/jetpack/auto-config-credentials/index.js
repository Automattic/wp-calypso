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
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_AUTOCONFIGURE_SUCCESS
} from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';

export const request = ( { dispatch }, action ) => {
	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/activity-log/${ action.siteId }/rewind/activate`,
		onSuccess: action,
		onFailure: action
	} ) );

	dispatch( successNotice( i18n.translate( 'Obtaining your credentials…' ), { duration: 2000 } ) );
};

export const success = ( { dispatch } ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_AUTOCONFIGURE_SUCCESS
	} );

	dispatch( successNotice( i18n.translate( 'Your credentials have been auto configured.' ), { duration: 4000 } ) );
};

export const failure = ( { dispatch } ) => {
	dispatch( errorNotice( i18n.translate( 'Error auto configuring your credentials.' ), { duration: 4000 } ) );
};

export default {
	[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: [ dispatchRequest( request, success, failure ) ]
};
