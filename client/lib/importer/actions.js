/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
const wpcom = require( 'lib/wp' ).undocumented();

/**
 * Internal dependencies
 */
import { actionTypes } from './constants';
import { fromApi, toApi } from './common';

const apiSuccess = data => {
	Dispatcher.handleViewAction( {
		type: actionTypes.API_SUCCESS
	} );

	return data;
};

export function cancelImport( siteId, importerId ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.CANCEL_IMPORT,
		importerId,
		siteId
	} );
}

export function failUpload( importerId, error ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.FAIL_UPLOAD,
		importerId,
		error
	} );
}

export function fetchState( siteId ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.API_REQUEST
	} );

	return wpcom.fetchImporterState( siteId )
		.then( apiSuccess )
		.then( importers => importers.map( fromApi ) )
		.then( importers => importers.map( importerStatus => {
			Dispatcher.handleViewAction( {
				type: actionTypes.RECEIVE_IMPORT_STATUS,
				importerStatus
			} );
		} ) )
		.catch( () => Dispatcher.handleViewAction( {
			type: actionTypes.API_FAILURE
		} ) );
}

export function finishUpload( importerId, importerStatus ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.FINISH_UPLOAD,
		importerId, importerStatus
	} );
}

export function mapAuthor( importerId, sourceAuthor, targetAuthor ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.MAP_AUTHORS,
		importerId,
		sourceAuthor,
		targetAuthor
	} );
}

export function resetImport( siteId, importerId ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.RESET_IMPORT,
		importerId,
		siteId
	} );
}

// Use when developing to force a new state into the store
export function setState( newState ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.DEV_SET_STATE,
		newState
	} );
}

export function startMappingAuthors( importerId ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.START_MAPPING_AUTHORS,
		importerId
	} );
}

export function setUploadProgress( importerId, data ) {
	Dispatcher.handleViewAction( {
		type: actionTypes.SET_UPLOAD_PROGRESS,
		uploadLoaded: data.uploadLoaded,
		uploadTotal: data.uploadTotal,
		importerId
	} );
}

export function startImport( siteId, importerType ) {
	// Use a fake ID until the server returns the real one
	let importerId = `${ Math.round( Math.random() * 10000 ) }`;

	Dispatcher.handleViewAction( {
		type: actionTypes.START_IMPORT,
		importerId,
		importerType,
		siteId
	} );
}

export function startImporting( importerStatus ) {
	const { importerId, site: { ID: siteId } } = importerStatus;

	Dispatcher.handleViewAction( {
		type: actionTypes.START_IMPORTING,
		importerId
	} );

	wpcom.updateImporter( siteId, toApi( importerStatus ) );
}

export function startUpload( importerStatus, file ) {
	let { id: importerId, site: { ID: siteId } } = importerStatus;

	Dispatcher.handleViewAction( {
		type: actionTypes.START_UPLOAD,
		filename: file.name,
		importerId
	} );

	wpcom.uploadExportFile( siteId, {
		importStatus: toApi( importerStatus ),
		file,

		onload: ( error, data ) => {
			if ( ! error ) {
				return finishUpload( importerId, data );
			}

			failUpload( importerId, error.message );
		},

		onprogress: event => {
			setUploadProgress( importerId, {
				uploadLoaded: event.loaded,
				uploadTotal: event.total
			} );
		},

		onabort: () => cancelImport( importerId )
	} );
}
