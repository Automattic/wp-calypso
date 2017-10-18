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
	JETPACK_CREDENTIALS_REQUEST,
	JETPACK_CREDENTIALS_STORE
} from 'state/action-types';
import { errorNotice } from 'state/notices/actions';

export const request = ( { dispatch }, action ) => dispatch( http( {
	apiVersion: '1.1',
	method: 'GET',
	path: `/activity-log/${ action.siteId }/get-credentials`,
	onSuccess: action,
	onFailure: action
} ) );

export const store = ( { dispatch }, action, credentials ) => dispatch( {
	type: JETPACK_CREDENTIALS_STORE,
	credentials
} );

export const failure = ( { dispatch }, action ) => {
	if ( action.meta.dataLayer.data.error !== 'No credentials found for this site.' ) {
		dispatch( errorNotice(
			i18n.translate( 'Unexpected problem retrieving credentials. Please try again.' )
		) );
	}
};

export default {
	[ JETPACK_CREDENTIALS_REQUEST ]: [ dispatchRequest( request, store, failure ) ],
};
