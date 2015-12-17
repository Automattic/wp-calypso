/**
 * Internal dependencies
 */
import notices from 'notices';
import wpcom from 'lib/wp';
import debugModule from 'debug';
import i18n from 'lib/mixins/i18n';

import { prepareExportRequest, getDataState } from './selectors';
import { getSelectedSite } from 'state/ui/selectors';

const debug = debugModule( 'calypso:exporter' );
const wpcomUndocumented = wpcom.undocumented();

import {
	SET_EXPORT_POST_TYPE,
	SET_EXPORTER_ADVANCED_SETTING,

	FETCH_EXPORTER_ADVANCED_SETTINGS,
	RECEIVE_EXPORTER_ADVANCED_SETTINGS,

	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from 'state/action-types';

const ERROR_START_EXPORT = i18n.translate( 'We had a problem starting your export. Please check your internet connection and try again.' );
const ERROR_POLLING = i18n.translate( 'We had a problem checking the status of your export. Please check your internet connection and try again.' );
const ERROR_PROCESSING = i18n.translate( 'We had a problem processing your export. Please contact support.' );

/**
 * Sets the post type to export.
 *
 * @param  {Object} postType   The name of the post type to use - 'posts', 'pages', 'feedback', or null for all
 * @return {Object}            Action object
 */
export function setPostType( postType ) {
	return {
		type: SET_EXPORT_POST_TYPE,
		postType
	};
}

/**
 * Sets one of the advanced export settings values in the UI
 *
 * @param  {string} section   The name of the section containing the setting - 'posts', 'pages', or 'feedback'
 * @param  {string} setting   The name of the setting
 * @param  {any}    value     The new value for the setting
 * @return {Object}           Action object
 */
export function setAdvancedSetting( section, setting, value ) {
	return {
		type: SET_EXPORTER_ADVANCED_SETTING,
		section,
		setting,
		value
	};
}

/**
 * Ensure that we are fetching or have fetched the available export
 * settings for the current site.
 *
 * @param  {int}      siteId  The ID of the site for which to retrieve export settings
 * @return {Function}         Action thunk
 */
export function ensureHasSettings() {
	return ( dispatch, getState ) => {
		const state = getState();
		const selectedSite = getSelectedSite( state );
		const currentDataSiteId = getDataState( state ).forSiteId;

		if ( selectedSite ) {
			if ( selectedSite.ID !== currentDataSiteId ) {
				dispatch( fetchExportSettings( selectedSite.ID ) );
			}
		}

	}
}

/**
 * Request the available settings for customizing an export.
 *
 * @param  {int}      siteId  The ID of the site for which to retrieve export settings
 * @return {Function}         Action thunk
 */
export function fetchExportSettings( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: FETCH_EXPORTER_ADVANCED_SETTINGS,
			siteId: siteId
		} );

		wpcomUndocumented.getExportSettings( siteId, ( error, data ) => {
			dispatch( receiveExportSettings( siteId, data ) );
		} );
	}
}

/**
 * Called when the available export settings are returned from the server.
 *
 * @param  {int}      siteId  The ID of the site for which the export settings belong
 * @param  {Object}   data    The data returned from the server
 * @return {Function}         Action thunk
 */
export function receiveExportSettings( siteId, data ) {
	return {
		type: RECEIVE_EXPORTER_ADVANCED_SETTINGS,
		siteId: siteId,
		data: data
	};
}

/**
 * Sends a request to the server to start an export.
 *
 * @param {number}    siteId            The ID of the site to export
 * @param {number}    advancedSettings  Advanced settings for the site
 * @return {Function}                   Action thunk
 */
export function startExport( siteId ) {
	return ( dispatch, getState ) => {
		const advancedSettings = prepareExportRequest( getState() );

		dispatch( {
			type: REQUEST_START_EXPORT,
			siteId: siteId,
			advancedSettings: advancedSettings
		} );

		wpcomUndocumented.startExport( siteId, advancedSettings, ( startError, startResponse ) => {
			debug( startError, startResponse );
			if ( startError ) {
				dispatch( failExport( ERROR_START_EXPORT ) );
				return;
			}

			dispatch( replyStartExport() );

			// Poll for completion of the export
			let poll = ( timeout ) => {
				setTimeout( () => {
					wpcomUndocumented.getExport( siteId, 0, ( pollError, pollResponse ) => {
						debug( pollError, pollResponse );
						if ( pollError ) {
							dispatch( failExport( ERROR_POLLING ) );
							return;
						}

						if ( pollResponse.status === 'running' ) {
							poll( 500 );
						} else if ( pollResponse.status === 'finished' ) {
							dispatch( completeExport( pollResponse.$attachment_url ) );
						} else {
							dispatch( failExport( ERROR_PROCESSING ) );
						}
					} );
				}, timeout );
			}
			poll( 0 );
		} );
	}
}

/**
 * Called when the server acknowledges a request to begin an export
 *
 * @return {Object}         Action object
 */
export function replyStartExport() {
	return {
		type: REPLY_START_EXPORT
	}
}

/**
 * Called when an export fails
 *
 * @param  {string} failureReason   User displayed reason for the failure
 * @return {Object}                 Action object
 */
export function failExport( failureReason ) {
	notices.error(
		failureReason,
		{
			button: i18n.translate( 'Get Help' ),
			href: 'https://support.wordpress.com/'
		}
	);

	return {
		type: FAIL_EXPORT
	}
}

/**
 * Called when an export completes
 *
 * @param  {string} downloadURL     A link to download the export file
 * @return {Object}                 Action object
 */
export function completeExport( downloadURL ) {
	notices.success(
		i18n.translate( 'Your export was successful! A download link has also been sent to your email.' ),
		{
			button: i18n.translate( 'Download' ),
			href: downloadURL
		}
	);

	return {
		type: COMPLETE_EXPORT
	}
}
