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
import { JETPACK_CREDENTIALS_REQUEST, JETPACK_CREDENTIALS_STORE } from 'state/action-types';
import { errorNotice } from 'state/notices/actions';

export const fetch = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: `/activity-log/${ action.siteId }/get-credentials`,
			},
			action
		)
	);

export const store = ( { dispatch }, action, credentials ) =>
	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials,
		siteId: action.siteId,
	} );

export const announceFailure = ( { dispatch } ) =>
	dispatch(
		errorNotice( i18n.translate( 'Unexpected problem retrieving credentials. Please try again.' ) )
	);

const fromApi = response => {
	if ( response.ok ) {
		return response.credentials;
	}

	// this is an API goof - we get a false value for `ok` instead of an empty list
	if ( ! response.ok && response.error === 'No credentials found for this site.' ) {
		return {};
	}

	throw new Error( 'Could not obtain credentials' );
};

export default {
	[ JETPACK_CREDENTIALS_REQUEST ]: [
		dispatchRequest( fetch, store, announceFailure, { fromApi } ),
	],
};
