import { withStorageKey } from '@automattic/state-utils';
import { get, isEmpty, map, omit, omitBy } from 'lodash';
import {
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_IMPORT_RECEIVED_RESET,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_START,
	IMPORTS_IMPORT_UNLOCK,
	IMPORTS_START_IMPORTING,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_PRE_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
	IMPORTS_OPEN_SUMMARY_MODAL,
	IMPORTS_CLOSE_SUMMARY_MODAL,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import { fromApi } from './api';
import { appStates } from './constants';
import siteImporter from './site-importer/reducer';
import uploads from './uploads/reducer';
import urlAnalyzer from './url-analyzer/reducer';

function isImporterStatusHydrated( state = false, action ) {
	switch ( action.type ) {
		case IMPORTS_IMPORT_RECEIVE:
			return true;
		case IMPORTS_IMPORT_RECEIVED_RESET:
			return false;
	}

	return state;
}

function importerStatus( state = {}, action ) {
	switch ( action.type ) {
		case IMPORTS_IMPORT_CANCEL:
		case IMPORTS_IMPORT_RESET:
			return omit( state, action.importerId );

		case IMPORTS_UPLOAD_FAILED:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					importerState: appStates.UPLOAD_FAILURE,
					errorData: { type: 'uploadError', description: action.error },
				},
			};

		case IMPORTS_PRE_UPLOAD_FAILED:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					importerState: appStates.UPLOAD_FAILURE,
					errorData: { type: 'preUploadError', description: action.error, code: action.errorCode },
					file: action.file,
				},
			};

		case IMPORTS_UPLOAD_COMPLETED:
			return {
				...omit( state, action.importerId ),
				[ action.importerStatus.importerId ]: action.importerStatus,
			};

		case IMPORTS_IMPORT_RECEIVE: {
			// The REST endpoint returns an empty `[]` array if there are no known imports.
			// In that case we don't update the `importerStatus` map, and only mark it as hydrated.
			if ( isEmpty( action.importerStatus ) ) {
				return state;
			}

			// don't receive the response if the importer is locked
			if ( action.isLocked ) {
				return state;
			}

			// convert the response with `fromApi` only after we know it's not empty
			const newImporterStatus = fromApi( action.importerStatus );

			return omitBy(
				{
					// filter the original set of importers...
					...state,
					// ...and the importer being received.
					[ newImporterStatus.importerId ]: newImporterStatus,
				},
				( importer ) =>
					[ appStates.CANCEL_PENDING, appStates.DEFUNCT, appStates.EXPIRED ].includes(
						importer.importerState
					)
			);
		}

		case IMPORTS_AUTHORS_START_MAPPING:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					importerState: appStates.MAP_AUTHORS,
				},
			};

		case IMPORTS_AUTHORS_SET_MAPPING:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					customData: {
						...state[ action.importerId ]?.customData,
						sourceAuthors: map(
							get( state[ action.importerId ], 'customData.sourceAuthors' ),
							( author ) =>
								action.sourceAuthor.id === author.id
									? {
											...author,
											mappedTo: action.targetAuthor,
									  }
									: author
						),
					},
				},
			};

		case IMPORTS_UPLOAD_SET_PROGRESS:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					percentComplete: ( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100,
				},
			};

		case IMPORTS_IMPORT_START:
			return {
				...state,
				[ action.importerId ]: {
					importerId: action.importerId,
					importerState: appStates.READY_FOR_UPLOAD,
					site: { ID: action.siteId },
					type: action.importerType,
				},
			};

		case IMPORTS_START_IMPORTING:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					importerState: appStates.IMPORTING,
				},
			};

		case IMPORTS_UPLOAD_START:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					importerState: appStates.UPLOADING,
					filename: action.filename,
				},
			};

		case IMPORTS_OPEN_SUMMARY_MODAL:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					summaryModalOpen: true,
				},
			};

		case IMPORTS_CLOSE_SUMMARY_MODAL:
			return {
				...state,
				[ action.importerId ]: {
					...state[ action.importerId ],
					summaryModalOpen: false,
				},
			};
	}

	return state;
}

const importerLocks = keyedReducer( 'importerId', ( state = false, action ) => {
	switch ( action.type ) {
		case IMPORTS_IMPORT_LOCK:
			return true;
		case IMPORTS_IMPORT_UNLOCK:
			return false;
	}

	return state;
} );

const combinedReducer = combineReducers( {
	importerLocks,
	importerStatus,
	isImporterStatusHydrated,
	uploads,
	siteImporter,
	urlAnalyzer,
} );

export default withStorageKey( 'imports', combinedReducer );
