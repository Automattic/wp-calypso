import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { ADMIN_COLOR_REQUEST, ADMIN_COLOR_SAVE } from 'calypso/state/action-types';
import {
	receiveAdminColor,
	saveAdminColorSuccess,
	saveAdminColorFailure,
} from 'calypso/state/admin-color/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export const requestFetchAdminColor = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-color/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const handleSuccess =
	( { siteId }, response ) =>
	( dispatch ) => {
		return dispatch( receiveAdminColor( siteId, response.admin_color ) );
	};

export const handleError = () => {
	return null;
};

/*
 * Post settings to WordPress.com API at /me/settings endpoint
 */
export function adminColorSave( action ) {
	return ( dispatch ) => {
		const { adminColor, siteId } = action;
		if ( ! isEmpty( adminColor ) ) {
			dispatch(
				http(
					{
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						path: `/sites/${ siteId }/profile`,
						body: { admin_color: adminColor },
					},
					action
				)
			);
		}
	};
}

export function adminColorSaveFailure( { data }, error ) {
	return [
		errorNotice( error.message || translate( 'There was a problem saving your changes.' ), {
			id: 'color-scheme-picker-save',
			duration: 10000,
		} ),
		saveAdminColorFailure( data, error ),
	];
}

export const adminColorSaveSuccess = ( data ) => async ( dispatch ) => {
	dispatch( saveAdminColorSuccess( data.siteId, data.adminColor ) );
	dispatch(
		successNotice( translate( 'Settings saved successfully!' ), {
			id: 'color-scheme-picker-save',
			duration: 10000,
		} )
	);
};

registerHandlers( 'state/data-layer/wpcom/admin-color/index.js', {
	[ ADMIN_COLOR_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchAdminColor,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
	[ ADMIN_COLOR_SAVE ]: [
		dispatchRequest( {
			fetch: adminColorSave,
			onSuccess: adminColorSaveSuccess,
			onError: adminColorSaveFailure,
		} ),
	],
} );
