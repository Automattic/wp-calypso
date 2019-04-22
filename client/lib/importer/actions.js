/** @format */

/**
 * External dependencies
 */

import Dispatcher from 'dispatcher';
import { flowRight } from 'lodash';
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

/**
 * Internal dependencies
 */
import {
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';
import { fromApi, toApi } from './common';
import { reduxDispatch } from 'lib/redux-bridge';
import { cancelImport, finishUpload } from 'state/imports/actions';

const createReduxDispatchable = action =>
	flowRight(
		reduxDispatch,
		action
	);

const dispatchCancelImport = createReduxDispatchable( cancelImport );

export const setUploadProgress = ( importerId, data ) => ( {
	type: IMPORTS_UPLOAD_SET_PROGRESS,
	uploadLoaded: data.uploadLoaded,
	uploadTotal: data.uploadTotal,
	importerId,
} );

export const startUpload = ( importerStatus, file ) => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	const startUploadAction = {
		type: IMPORTS_UPLOAD_START,
		filename: file.name,
		importerId,
	};
	Dispatcher.handleViewAction( startUploadAction );
	reduxDispatch( startUploadAction );

	wpcom
		.uploadExportFile( siteId, {
			importStatus: toApi( importerStatus ),
			file,
			onprogress: event => {
				const uploadProgressAction = setUploadProgress( importerId, {
					uploadLoaded: event.loaded,
					uploadTotal: event.total,
				} );

				Dispatcher.handleViewAction( uploadProgressAction );
				reduxDispatch( uploadProgressAction );
			},
			onabort: () => dispatchCancelImport( siteId, importerId ),
		} )
		.then( data => Object.assign( data, { siteId } ) )
		.then( fromApi )
		.then( importerData => {
			reduxDispatch( finishUpload( importerId, importerData ) );
		} )
		.catch( error => {
			const failUploadAction = {
				type: IMPORTS_UPLOAD_FAILED,
				importerId,
				error: error.message,
			};

			Dispatcher.handleViewAction( failUploadAction );
			reduxDispatch( failUploadAction );
		} );
};
