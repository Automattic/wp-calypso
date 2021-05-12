/**
 * Internal dependencies
 */
import {
	MAILCHIMP_SETTINGS_LIST,
	MAILCHIMP_SETTINGS_RECEIVE,
	MAILCHIMP_SETTINGS_UPDATE,
	MAILCHIMP_SETTINGS_UPDATE_SUCCESS,
	MAILCHIMP_SETTINGS_UPDATE_FAILURE,
} from 'calypso/state/action-types';
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import 'calypso/state/data-layer/wpcom/sites/mailchimp';
import 'calypso/state/mailchimp/init';

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
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MAILCHIMP_SETTINGS_UPDATE_FAILURE,
					siteId,
					error,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
