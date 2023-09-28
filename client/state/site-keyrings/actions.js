import wpcom from 'calypso/lib/wp';
import {
	SITE_KEYRINGS_REQUEST,
	SITE_KEYRINGS_REQUEST_FAILURE,
	SITE_KEYRINGS_REQUEST_SUCCESS,
	SITE_KEYRINGS_SAVE_SUCCESS,
	SITE_KEYRINGS_DELETE,
	SITE_KEYRINGS_DELETE_FAILURE,
	SITE_KEYRINGS_DELETE_SUCCESS,
	SITE_KEYRINGS_UPDATE,
	SITE_KEYRINGS_UPDATE_SUCCESS,
	SITE_KEYRINGS_UPDATE_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/site-keyrings/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve site keyrings
 * @param  {number} siteId Site ID
 * @returns {Function}      Action thunk
 */
export function requestSiteKeyrings( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_KEYRINGS_REQUEST,
			siteId,
		} );

		return wpcom.req
			.get( `/sites/${ siteId }/keyrings` )
			.then( ( keyrings ) => {
				dispatch( {
					type: SITE_KEYRINGS_REQUEST_SUCCESS,
					siteId,
					keyrings,
				} );

				return keyrings;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_KEYRINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );

				return Promise.reject( error );
			} );
	};
}

export function createSiteKeyring( siteId, keyring ) {
	return ( dispatch ) =>
		wpcom.req.post( `/sites/${ siteId }/keyrings`, {}, keyring ).then( ( body ) => {
			dispatch( {
				type: SITE_KEYRINGS_SAVE_SUCCESS,
				siteId,
				keyring,
			} );

			return body;
		} );
}

export function updateSiteKeyring( siteId, keyringId, externalUserId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_KEYRINGS_UPDATE,
			siteId,
			keyringId,
			externalUserId,
		} );

		return wpcom.req
			.post(
				`/sites/${ siteId }/keyrings/${ keyringId }`,
				{},
				{
					external_user_id: externalUserId,
				}
			)
			.then( ( body ) => {
				dispatch( {
					type: SITE_KEYRINGS_UPDATE_SUCCESS,
					siteId,
					keyringId,
					externalUserId,
				} );

				return body;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_KEYRINGS_UPDATE_FAILURE,
					siteId,
					keyringId,
					externalUserId,
					error,
				} );

				return Promise.reject( error );
			} );
	};
}

export function deleteSiteKeyring( siteId, keyringId, externalUserId = null ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_KEYRINGS_DELETE,
			siteId,
			keyringId,
			externalUserId,
		} );

		return wpcom.req
			.post(
				`/sites/${ siteId }/keyrings/${ keyringId }/delete`,
				{},
				{
					external_user_id: externalUserId,
				}
			)
			.then( ( body ) => {
				dispatch( {
					type: SITE_KEYRINGS_DELETE_SUCCESS,
					siteId,
					keyringId,
					externalUserId,
				} );

				return body;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_KEYRINGS_DELETE_FAILURE,
					error,
					siteId,
					keyringId,
					externalUserId,
				} );

				return Promise.reject( error );
			} );
	};
}
