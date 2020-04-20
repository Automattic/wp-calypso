/**
 * Internal dependencies
 */

import {
	MAILCHIMP_SETTINGS_LIST,
	MAILCHIMP_SETTINGS_RECEIVE,
	MAILCHIMP_SETTINGS_UPDATE,
	MAILCHIMP_SETTINGS_UPDATE_SUCCESS,
	MAILCHIMP_SETTINGS_UPDATE_FAILURE,
	NOTICE_CREATE,
} from 'state/action-types';
import wpcom from 'lib/wp';

import 'state/data-layer/wpcom/sites/mailchimp';

export const requestSettings = ( siteId ) => ( {
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

export const requestSettingsUpdate = ( siteId, settings, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MAILCHIMP_SETTINGS_UPDATE,
			siteId,
			settings,
		} );

		return wpcom.req
			.post( `/sites/${ siteId }/mailchimp/settings`, settings )
			.then( ( data ) => {
				dispatch( {
					type: MAILCHIMP_SETTINGS_UPDATE_SUCCESS,
					siteId,
					settings: data,
				} );
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 5000,
						text: noticeText,
						status: 'is-success',
					},
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MAILCHIMP_SETTINGS_UPDATE_FAILURE,
					siteId,
					error,
				} );
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 10000,
						text: error.message,
						status: 'is-error',
					},
				} );
			} );
	};
};
