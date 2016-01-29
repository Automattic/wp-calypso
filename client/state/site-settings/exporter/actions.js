/**
 * Internal dependencies
 */
import notices from 'notices';
import i18n from 'lib/mixins/i18n';
import wpcom from 'lib/wp';

import {
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	SET_EXPORT_POST_TYPE,
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from 'state/action-types';

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
 * Fetches the available advanced settings for customizing export content
 * @param {Number} siteId The ID of the site to fetch
 * @return {thunk}        An action thunk for fetching the advanced settings
 */
export function advancedSettingsFetch( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: EXPORT_ADVANCED_SETTINGS_FETCH,
			siteId
		} );

		const updateExportSettings =
			settings => dispatch( advancedSettingsReceive( siteId, settings ) );

		const fetchFail =
			error => dispatch( advancedSettingsFail( siteId, error ) );

		return wpcom.undocumented()
			.getExportSettings( siteId )
			.then( updateExportSettings )
			.catch( fetchFail )
	}
}

export function advancedSettingsReceive( siteId, advancedSettings ) {
	return {
		type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
		siteId,
		advancedSettings
	};
}

export function advancedSettingsFail( siteId, error ) {
	return {
		type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
		siteId,
		error
	};
}

/**
 * Sends a request to the server to start an export.
 *
 * @return {Function}         Action thunk
 */
export function startExport() {
	return ( dispatch ) => {
		dispatch( {
			type: REQUEST_START_EXPORT
		} );

		// This will be replaced with an API call to start the export
		setTimeout( () => {
			dispatch( replyStartExport() );

			// This will be replaced with polling to check when the export completes
			setTimeout( () => {
				dispatch( completeExport( '#', 'testing-2015-01-01.xml' ) );
				//dispatch( failExport( 'The reason for failure would be displayed here' ) );
			}, 1400 );
		}, 400 );
	}
}

export function replyStartExport() {
	return {
		type: REPLY_START_EXPORT
	}
}

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
