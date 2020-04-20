/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	SHARING_BUTTONS_RECEIVE,
	SHARING_BUTTONS_REQUEST,
	SHARING_BUTTONS_REQUEST_FAILURE,
	SHARING_BUTTONS_REQUEST_SUCCESS,
	SHARING_BUTTONS_SAVE,
	SHARING_BUTTONS_SAVE_FAILURE,
	SHARING_BUTTONS_SAVE_SUCCESS,
	SHARING_BUTTONS_UPDATE,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that sharing buttons have been received.
 *
 * @param  {number} siteId Site ID
 * @param  {object} settings The sharing buttons object
 * @returns {object}        Action object
 */
export function receiveSharingButtons( siteId, settings ) {
	return {
		type: SHARING_BUTTONS_RECEIVE,
		siteId,
		settings,
	};
}

/**
 * Returns an action object to be used in signalling that some sharing buttons have been updated.
 *
 * @param  {number} siteId Site ID
 * @param  {object} settings The updated sharing buttons
 * @returns {object}        Action object
 */
export function updateSharingButtons( siteId, settings ) {
	return {
		type: SHARING_BUTTONS_UPDATE,
		siteId,
		settings,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve sharing buttons
 *
 * @param  {number} siteId Site ID
 * @returns {Function}      Action thunk
 */
export function requestSharingButtons( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SHARING_BUTTONS_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.sharingButtons( siteId )
			.then( ( { sharing_buttons: settings } ) => {
				dispatch( receiveSharingButtons( siteId, settings ) );
				dispatch( {
					type: SHARING_BUTTONS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SHARING_BUTTONS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * update the sharing buttons
 *
 * @param  {number} siteId Site ID
 * @param  {object} settings The sharing buttons to save
 * @returns {Function}      Action thunk
 */
export function saveSharingButtons( siteId, settings ) {
	return ( dispatch ) => {
		dispatch( {
			type: SHARING_BUTTONS_SAVE,
			siteId,
		} );
		// Optimistic update
		dispatch( updateSharingButtons( siteId, settings ) );
		return wpcom
			.undocumented()
			.saveSharingButtons( siteId, settings )
			.then( ( { updated } ) => {
				dispatch( updateSharingButtons( siteId, updated ) );
				dispatch( {
					type: SHARING_BUTTONS_SAVE_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SHARING_BUTTONS_SAVE_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
