/** @format */

/**
 * Internal dependencies
 */

import {
	MAILCHIMP_SETTINGS_LIST,
	MAILCHIMP_SETTINGS_RECEIVE,
	MAILCHIMP_SETTINGS_UPDATE,
	MAILCHIMP_SETTINGS_UPDATE_SUCCESS,
	MAILCHIMP_SETTINGS_UPDATE_FAILURE,
} from 'state/action-types';
import wpcom from 'lib/wp';

import 'state/data-layer/wpcom/sites/mailchimp';

export const requestSettings = siteId => ( {
	siteId,
	type: MAILCHIMP_SETTINGS_LIST,
} );

export function receiveSettings( siteId, lists ) {
	return {
		siteId,
		type: MAILCHIMP_SETTINGS_RECEIVE,
		lists,
	};
}

export const requestSettingsUpdate = ( siteId, settings ) => {
	return dispatch => {
		dispatch( {
			type: MAILCHIMP_SETTINGS_UPDATE,
			siteId,
			settings,
		} );

		return wpcom.req
			.post( `/sites/${ siteId }/mailchimp/settings`, settings )
			.then( data => {
				dispatch( {
					type: MAILCHIMP_SETTINGS_UPDATE_SUCCESS,
					siteId,
					settings: data,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: MAILCHIMP_SETTINGS_UPDATE_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};
