/** @format */

/**
 * External dependencies
 */

import Dispatcher from 'dispatcher';
import { flowRight, reject } from 'lodash';
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

/**
 * Internal dependencies
 */
import {
	IMPORTS_FETCH,
	IMPORTS_FETCH_FAILED,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { fromApi, toApi } from './common';
import { reduxDispatch } from 'lib/redux-bridge';
import { cancelImport, finishUpload, receiveImporterStatus } from 'state/imports/actions';

const apiStart = () => {
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH } );
	reduxDispatch( { type: IMPORTS_FETCH } );
};
const apiSuccess = data => {
	const apiFetchCompleteAction = {
		type: IMPORTS_FETCH_COMPLETED,
	};

	Dispatcher.handleViewAction( apiFetchCompleteAction );
	reduxDispatch( {
		...apiFetchCompleteAction,
		data,
	} );

	return data;
};
const apiFailure = data => {
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH_FAILED } );
	reduxDispatch( { type: IMPORTS_FETCH_FAILED } );
	return data;
};

const createReduxDispatchable = action =>
	flowRight(
		reduxDispatch,
		action
	);

const dispatchReceiveImporterStatus = createReduxDispatchable( receiveImporterStatus );
const dispatchCancelImport = createReduxDispatchable( cancelImport );

const asArray = a => [].concat( a );

const rejectExpiredImporters = importers =>
	reject( importers, ( { importStatus } ) => importStatus === appStates.IMPORT_EXPIRED );

export function fetchState( siteId ) {
	apiStart();

	return wpcom
		.fetchImporterState( siteId )
		.then( apiSuccess )
		.then( asArray )
		.then( rejectExpiredImporters )
		.then( importers => importers.map( fromApi ) )
		.then( importers => importers.map( dispatchReceiveImporterStatus ) )
		.catch( apiFailure );
}

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
