/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	EXPORT_CLEAR,
	EXPORT_COMPLETE,
	EXPORT_FAILURE,
	EXPORT_START_REQUEST,
	EXPORT_STARTED,
	EXPORT_STATUS_FETCH,
	EXPORT_POST_TYPE_SET,
	EXPORT_POST_TYPE_FIELD_SET,
	EXPORT_MEDIA_REQUEST,
	SET_MEDIA_EXPORT_DATA,
} from 'calypso/state/action-types';

import { prepareExportRequest } from './selectors';

import 'calypso/state/data-layer/wpcom/sites/exports/media';
import 'calypso/state/exporter/init';

/**
 * Sets the post type to export.
 *
 * @param  {object} postType   The name of the post type to use - 'posts', 'pages', 'feedback', or null for all
 * @returns {object}            Action object
 */
export function setPostType( postType ) {
	return {
		type: EXPORT_POST_TYPE_SET,
		postType,
	};
}

export function setPostTypeFieldValue( siteId, postType, fieldName, value ) {
	return {
		type: EXPORT_POST_TYPE_FIELD_SET,
		siteId,
		postType,
		fieldName,
		value,
	};
}

/**
 * Fetches the available advanced settings for customizing export content
 *
 * @param {number} siteId The ID of the site to fetch
 * @returns {Function}        An action thunk for fetching the advanced settings
 */
export function advancedSettingsFetch( siteId ) {
	return ( dispatch, getState ) => {
		if ( siteId === null || typeof siteId === 'undefined' ) {
			return;
		}

		if ( getState().exporter.fetchingAdvancedSettings[ siteId ] === true ) {
			return;
		}

		dispatch( {
			type: EXPORT_ADVANCED_SETTINGS_FETCH,
			siteId,
		} );

		const updateExportSettings = ( settings ) =>
			dispatch( advancedSettingsReceive( siteId, settings ) );

		const fetchFail = ( error ) => dispatch( advancedSettingsFail( siteId, error ) );

		return wpcom
			.undocumented()
			.getExportSettings( siteId )
			.then( updateExportSettings )
			.catch( fetchFail );
	};
}

export function advancedSettingsReceive( siteId, advancedSettings ) {
	return {
		type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
		siteId,
		advancedSettings,
	};
}

export function advancedSettingsFail( siteId, error ) {
	return {
		type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
		siteId,
		error,
	};
}

/**
 * Sends a request to the server to start an export.
 *
 * @param  {number}   siteId  The ID of the site to export
 * @returns {Function}         Action thunk
 */
export function startExport( siteId, { exportAll = true } = {} ) {
	return ( dispatch, getState ) => {
		if ( ! siteId ) {
			return;
		}

		dispatch( {
			type: EXPORT_START_REQUEST,
			siteId,
			exportAll,
		} );

		const advancedSettings = prepareExportRequest( getState(), siteId, { exportAll } );

		const success = () => dispatch( exportStarted( siteId ) );

		const failure = ( error ) => dispatch( exportFailed( siteId, error ) );

		return wpcom
			.undocumented()
			.startExport( siteId, advancedSettings )
			.then( success )
			.catch( failure );
	};
}

export function exportStarted( siteId ) {
	return {
		type: EXPORT_STARTED,
		siteId,
	};
}

export function exportStatusFetch( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: EXPORT_STATUS_FETCH,
			siteId,
		} );

		const failure = ( error ) => {
			dispatch( exportFailed( siteId, error ) );
		};

		const success = ( response = {} ) => {
			switch ( response.status ) {
				case 'finished':
					return dispatch( exportComplete( siteId, response.attachment_url ) );
				case 'running':
					return;
			}

			return failure( response );
		};

		return wpcom.undocumented().getExport( siteId, 0 ).then( success ).catch( failure );
	};
}

export function exportFailed( siteId, error ) {
	return {
		type: EXPORT_FAILURE,
		siteId,
		error,
	};
}

export function exportComplete( siteId, downloadURL ) {
	return {
		type: EXPORT_COMPLETE,
		siteId,
		downloadURL,
	};
}

export function clearExport( siteId ) {
	return {
		type: EXPORT_CLEAR,
		siteId,
	};
}

export function requestMediaExport( siteId ) {
	return {
		type: EXPORT_MEDIA_REQUEST,
		siteId,
	};
}

export function setMediaExportData( mediaExportUrl ) {
	return {
		type: SET_MEDIA_EXPORT_DATA,
		mediaExportUrl,
	};
}
