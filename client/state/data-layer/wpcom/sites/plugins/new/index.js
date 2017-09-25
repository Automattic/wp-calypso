/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { find, includes, toLower } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { PLUGIN_UPLOAD } from 'state/action-types';
import { recordTracksEvent } from 'state/analytics/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { completePluginUpload, pluginUploadError, updatePluginUploadProgress } from 'state/plugins/upload/actions';
import { getSite } from 'state/sites/selectors';

export const uploadPlugin = ( { dispatch }, action ) => {
	const { siteId, file } = action;

	dispatch( recordTracksEvent( 'calypso_plugin_upload' ) );

	dispatch( http( {
		method: 'POST',
		path: `/sites/${ siteId }/plugins/new`,
		apiVersion: '1',
		formData: [ [ 'zip[]', file ] ],
	}, action ) );
};

const showErrorNotice = ( dispatch, error ) => {
	const knownErrors = {
		exists: translate( 'This plugin is already installed on your site.' ),
		'too large': translate( 'The plugin zip file must be smaller than 10MB.' ),
		incompatible: translate( 'Not a compatible plugin.' ),
		unsupported_mime_type: translate( 'Not a valid zip file.' ),
	};
	const errorString = toLower( error.error + error.message );
	const knownError = find( knownErrors, ( v, key ) => includes( errorString, key ) );

	if ( knownError ) {
		dispatch( errorNotice( knownError ) );
		return;
	}
	if ( error.error ) {
		dispatch( errorNotice( translate( 'Upload problem: %(error)s.', {
			args: { error: error.error }
		} ) ) );
		return;
	}
	dispatch( errorNotice( translate( 'Problem installing the plugin.' ) ) );
};

export const uploadComplete = ( { dispatch, getState }, { siteId }, data ) => {
	const { slug: pluginId } = data;
	const state = getState();
	const site = getSite( state, siteId );

	dispatch( recordTracksEvent( 'calypso_plugin_upload_complete', {
		plugin_id: pluginId
	} ) );

	dispatch( completePluginUpload( siteId, pluginId ) );

	/*
	 * Adding plugin to legacy flux store provides data for plugin page
	 * and displays a success message.
	 */
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_INSTALLED_PLUGIN',
		action: 'PLUGIN_UPLOAD',
		site,
		plugin: data,
		data,
	} );
};

export const receiveError = ( { dispatch }, { siteId }, error ) => {
	dispatch( recordTracksEvent( 'calypso_plugin_upload_error', {
		error_code: error.error,
		error_message: error.message
	} ) );

	showErrorNotice( dispatch, error );
	dispatch( pluginUploadError( siteId, error ) );
};

export const updateUploadProgress = ( { dispatch }, { siteId }, { loaded, total } ) => {
	const progress = total ? ( loaded / total ) * 100 : total;
	dispatch( updatePluginUploadProgress( siteId, progress ) );
};

export default {
	[ PLUGIN_UPLOAD ]: [ dispatchRequest(
		uploadPlugin,
		uploadComplete,
		receiveError,
		{ onProgress: updateUploadProgress }
	) ]
};

