/** @format */
/**
 * External dependencies
 */
import { castArray, each, includes } from 'lodash';
import Dispatcher from 'dispatcher';

/**
 * Internal dependencies
 */
import {
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_FETCH,
	IMPORTS_FETCH_FAILED,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_START,
	IMPORTS_IMPORT_UNLOCK,
	IMPORTS_START_IMPORTING,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
} from 'state/action-types';

import { fromApi, toApi } from 'lib/importer/common';
import { appStates } from 'state/imports/constants';

import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

const ID_GENERATOR_PREFIX = 'local-generated-id-';

export const cancelImport = ( siteId, importerId ) => dispatch => {
	dispatch( { type: IMPORTS_IMPORT_LOCK, importerId } );
	Dispatcher.handleViewAction( { type: IMPORTS_IMPORT_LOCK, importerId } );
	dispatch( {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	} );
	Dispatcher.handleViewAction( {
		type: IMPORTS_IMPORT_CANCEL,
		importerId,
		siteId,
	} );

	// Bail if this is merely a local importer object because
	// there is nothing on the server-side to cancel
	if ( includes( importerId, ID_GENERATOR_PREFIX ) ) {
		return;
	}

	dispatch( { type: IMPORTS_FETCH } );
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH } );

	wpcom
		.updateImporter(
			siteId,
			toApi( {
				importerId,
				importerState: appStates.CANCEL_PENDING,
				site: { ID: siteId },
			} )
		)
		.then( data => {
			const importerStatus = fromApi( data );

			dispatch( { type: IMPORTS_FETCH_COMPLETED } );
			Dispatcher.handleViewAction( { type: IMPORTS_FETCH_COMPLETED } );
			// TODO: handle lockedImporter match
			dispatch( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus,
			} );
			Dispatcher.handleViewAction( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus,
			} );
		} )
		.catch(
			() =>
				dispatch( { type: IMPORTS_FETCH_FAILED } ) &&
				Dispatcher.handleViewAction( { type: IMPORTS_FETCH_FAILED } )
		);
};

export const resetImport = ( siteId, importerId ) => dispatch => {
	// We are done with this import session, so lock it away
	dispatch( { type: IMPORTS_IMPORT_LOCK, importerId } );
	Dispatcher.handleViewAction( { type: IMPORTS_IMPORT_LOCK, importerId } );
	dispatch( {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	} );
	Dispatcher.handleViewAction( {
		type: IMPORTS_IMPORT_RESET,
		importerId,
		siteId,
	} );
	dispatch( { type: IMPORTS_FETCH } );
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH } );

	wpcom
		.updateImporter(
			siteId,
			toApi( {
				importerId,
				importerState: appStates.EXPIRE_PENDING,
				site: { ID: siteId },
			} )
		)
		.then( data => {
			const importerStatus = fromApi( data );

			dispatch( { type: IMPORTS_FETCH_COMPLETED } );
			Dispatcher.handleViewAction( { type: IMPORTS_FETCH_COMPLETED } );
			dispatch( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus,
			} );
			Dispatcher.handleViewAction( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus,
			} );
		} )
		.catch( () => {
			dispatch( { type: IMPORTS_FETCH_FAILED } );
			Dispatcher.handleViewAction( { type: IMPORTS_FETCH_FAILED } );
		} );
};

export const startImport = ( siteId, importerType ) => dispatch => {
	const action = {
		// Use a fake ID until the server returns the real one
		importerId: `${ ID_GENERATOR_PREFIX }${ Math.round( Math.random() * 10000 ) }`,
		type: IMPORTS_IMPORT_START,
		importerType,
		siteId,
	};

	dispatch( action );
	Dispatcher.handleViewAction( action );
};

export const startImporting = importerStatus => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	return dispatch => {
		dispatch( { type: IMPORTS_IMPORT_UNLOCK, importerId } );
		Dispatcher.handleViewAction( { type: IMPORTS_IMPORT_UNLOCK, importerId } );
		dispatch( {
			type: IMPORTS_START_IMPORTING,
			importerId,
		} );
		Dispatcher.handleViewAction( {
			type: IMPORTS_START_IMPORTING,
			importerId,
		} );

		wpcom.updateImporter(
			siteId,
			toApi( {
				...importerStatus,
				importerState: appStates.IMPORTING,
			} )
		);
	};
};

export const finishUploadBasic = ( importerId, importerStatus ) => ( {
	type: IMPORTS_UPLOAD_COMPLETED,
	importerId,
	importerStatus,
} );

export const finishUpload = ( importerId, importerStatus ) => dispatch => {
	const action = finishUploadBasic( importerId, importerStatus );

	dispatch( action );
	Dispatcher.handleViewAction( action );
};

export const setUploadProgress = ( importerId, { uploadLoaded, uploadTotal } ) => dispatch => {
	const action = {
		type: IMPORTS_UPLOAD_SET_PROGRESS,
		uploadLoaded,
		uploadTotal,
		importerId,
	};

	dispatch( action );
	Dispatcher.handleViewAction( action );
};

export const failUpload = ( importerId, error ) => ( {
	type: IMPORTS_UPLOAD_FAILED,
	importerId,
	error,
} );

export const startUpload = ( importerStatus, file ) => dispatch => {
	const {
		importerId,
		site: { ID: siteId },
	} = importerStatus;

	wpcom
		.uploadExportFile( siteId, {
			importStatus: toApi( importerStatus ),
			file,
			onprogress: event =>
				dispatch(
					setUploadProgress( importerId, {
						uploadLoaded: event.loaded,
						uploadTotal: event.total,
					} )
				),

			onabort: () => cancelImport( siteId, importerId ),
		} )
		.then( data => {
			dispatch(
				finishUpload(
					importerId,
					fromApi( {
						...data,
						siteId,
					} )
				)
			);
			Dispatcher.handleViewAction(
				finishUpload(
					importerId,
					fromApi( {
						...data,
						siteId,
					} )
				)
			);
		} )
		.catch(
			error =>
				dispatch( failUpload( importerId, error ) ) &&
				Dispatcher.handleViewAction( failUpload( importerId, error ) )
		);
};

export const startMappingAuthors = importerId => dispatch => {
	dispatch( { type: IMPORTS_IMPORT_LOCK, importerId } );
	dispatch( {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	} );

	Dispatcher.handleViewAction( { type: IMPORTS_IMPORT_LOCK, importerId } );
	Dispatcher.handleViewAction( {
		type: IMPORTS_AUTHORS_START_MAPPING,
		importerId,
	} );
};

export const mapAuthorBasic = ( importerId, sourceAuthor, targetAuthor ) => ( {
	type: IMPORTS_AUTHORS_SET_MAPPING,
	importerId,
	sourceAuthor,
	targetAuthor,
} );

export const mapAuthor = ( importerId, sourceAuthor, targetAuthor ) => dispatch => {
	const action = mapAuthorBasic( importerId, sourceAuthor, targetAuthor );

	dispatch( action );
	Dispatcher.handleViewAction( action );
};

export const fetchState = siteId => dispatch => {
	dispatch( { type: IMPORTS_FETCH } );
	Dispatcher.handleViewAction( { type: IMPORTS_FETCH } );

	wpcom
		.fetchImporterState( siteId )
		.then( data => {
			const importers = castArray( data );
			dispatch( { type: IMPORTS_FETCH_COMPLETED } );
			Dispatcher.handleViewAction( { type: IMPORTS_FETCH_COMPLETED } );

			each( importers, importer => {
				const importerStatus = fromApi( importer );
				// TODO: handle lockedImporter match
				dispatch( {
					type: IMPORTS_IMPORT_RECEIVE,
					importerStatus,
				} );
				Dispatcher.handleViewAction( {
					type: IMPORTS_IMPORT_RECEIVE,
					importerStatus,
				} );
			} );
		} )
		.catch( () => {
			dispatch( { type: IMPORTS_FETCH_FAILED } );
			Dispatcher.handleViewAction( { type: IMPORTS_FETCH_FAILED } );
		} );
};
