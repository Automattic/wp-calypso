import wpcom from 'calypso/lib/wp';
import { MAILCHIMP_SETTINGS_LIST, MAILCHIMP_SETTINGS_RECEIVE } from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import 'calypso/state/data-layer/wpcom/sites/mailchimp';
import 'calypso/state/mailchimp/init';

export const requestSettings = ( siteId ) => ( {
	siteId,
	type: MAILCHIMP_SETTINGS_LIST,
} );

export const requestSettingsUpdate = ( siteId, settings, noticeText ) => {
	return ( dispatch ) => {
		return wpcom.req
			.post( `/sites/${ siteId }/mailchimp/settings`, settings )
			.then( ( data ) => {
				dispatch( {
					type: MAILCHIMP_SETTINGS_RECEIVE,
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
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
