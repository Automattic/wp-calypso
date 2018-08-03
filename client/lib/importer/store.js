/** @format */
/**
 * External dependencies
 */
import { get, filter, includes, map, omit } from 'lodash';

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
	IMPORTS_STORE_RESET,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';
import { createReducerStore } from 'lib/store';

/**
 * Module variables
 */
const initialState = Object.freeze( {
	count: 0,
	importers: {},
	importerLocks: {},
	api: {
		isHydrated: false,
		isFetching: false,
		retryCount: 0,
	},
} );

const getImporterItemById = ( state, id ) => get( state, [ 'importers', id ], {} );

// Why is this here, could it not be part of the main switch?
const adjustImporterLock = ( state, { action } ) => {
	switch ( action.type ) {
		case IMPORTS_IMPORT_LOCK:
			state = {
				...state,
				importerLocks: {
					...state.importerLocks,
					[ action.importerId ]: true,
				},
			};

		case IMPORTS_IMPORT_UNLOCK:
			state = {
				...state,
				importerLocks: {
					...state.importerLocks,
					[ action.importerId ]: false,
				},
			};
	}

	return state;
};

const ImporterStore = createReducerStore( function( state, payload ) {
	const { action } = payload;
	let newState = { ...state };

	switch ( action.type ) {
		case IMPORTS_STORE_RESET:
			// this is here to enable
			// unit-testing the store
			newState = initialState;
			break;

		case IMPORTS_FETCH:
			newState = {
				...newState,
				api: {
					...newState.api,
					isFetching: true,
				},
			};
			break;

		case IMPORTS_FETCH_FAILED:
			newState = {
				...newState,
				api: {
					...newState.api,
					isFetching: false,
					retryCount: get( newState, 'api.retryCount', 0 ) + 1,
				},
			};
			break;

		case IMPORTS_FETCH_COMPLETED:
			newState = {
				...newState,
				api: {
					...newState.api,
					isFetching: false,
					isHydrated: true,
					retryCount: 0,
				},
			};
			break;

		case IMPORTS_IMPORT_CANCEL:
		case IMPORTS_IMPORT_RESET:
			newState = {
				...newState,
				importers: {
					...omit( newState.importers, action.importerId ),
				},
			};
			break;

		case IMPORTS_UPLOAD_FAILED: {
			const { importerId } = action;
			const importerItem = getImporterItemById( newState, importerId );

			newState = {
				...newState,
				importers: {
					...newState.importers,
					[ importerId ]: {
						...importerItem,
						importerState: appStates.UPLOAD_FAILURE,
						errorData: {
							type: 'uploadError',
							description: action.error,
						},
					},
				},
			};
			break;
		}
		case IMPORTS_UPLOAD_COMPLETED:
			newState = {
				...newState,
				importers: {
					...omit( newState.importers, action.importerId ),
					[ action.importerStatus.importerId ]: action.importerStatus,
				},
			};
			break;

		case IMPORTS_AUTHORS_START_MAPPING: {
			const { importerId } = action;
			const importerItem = getImporterItemById( newState, importerId );

			newState = {
				...newState,
				importers: {
					...newState.importers,
					[ importerId ]: {
						...importerItem,
						importerState: appStates.MAP_AUTHORS,
					},
				},
			};
			break;
		}
		case IMPORTS_AUTHORS_SET_MAPPING: {
			const { importerId, sourceAuthor, targetAuthor } = action;
			const importerItem = getImporterItemById( newState, importerId );

			newState = {
				...newState,
				importers: {
					...newState.importers,
					[ importerId ]: {
						...importerItem,
						customData: {
							...importerItem.customData,
							sourceAuthors: {
								...map(
									get( importerItem, 'customData.sourceAuthors' ),
									author =>
										sourceAuthor.id === author.id
											? {
													...author,
													mappedTo: targetAuthor,
											  }
											: author
								),
							},
						},
					},
				},
			};
			break;
		}
		case IMPORTS_IMPORT_RECEIVE:
			newState = {
				...newState,
				api: {
					...newState.api,
					isHydrated: true,
				},
			};

			if ( get( newState, [ 'importerLocks', action.importerStatus.importerId ], false ) ) {
				break;
			}

			// remove by id if the incoming instance is defunt
			// as mentioned later, this would be taken care of by the filtering function anyway
			if ( action.importerStatus.importerState === appStates.DEFUNCT ) {
				newState = {
					...newState,
					importers: {
						...omit( newState.importers, action.importerStatus.importerId ),
					},
				};
			}

			// We filter through all importer instances and remove any that are defunt or cancelled
			// Do we really need the above 'delete if defunt' action then? Whats it's value?
			newState = {
				...newState,
				importers: {
					...filter(
						{
							...newState.importers,
							[ action.importerStatus.importerId ]: action.importerStatus,
						},
						importer =>
							includes( [ appStates.CANCEL_PENDING, appStates.DEFUNCT ], importer.importerState )
					),
				},
			};

			break;

		case IMPORTS_UPLOAD_SET_PROGRESS:
			newState = {
				...newState,
				importers: {
					...newState.importers,
					[ action.importerId ]: {
						...getImporterItemById( newState, action.importerId ),
						percentComplete:
							( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100,
					},
				},
			};
			break;

		case IMPORTS_IMPORT_START:
			newState = {
				...newState,
				count: get( newState, 'count', 0 ) + 1,
				importers: {
					...newState.importers,
					[ action.importerId ]: {
						importerId: action.importerId,
						type: action.importerType,
						importerState: appStates.READY_FOR_UPLOAD,
						site: { ID: action.siteId },
					},
				},
			};
			break;

		case IMPORTS_START_IMPORTING:
			newState = {
				...newState,
				importers: {
					...newState.importers,
					[ action.importerId ]: {
						...getImporterItemById( newState, action.importerId ),
						importerState: appStates.IMPORTING,
					},
				},
			};
			break;

		case IMPORTS_UPLOAD_START:
			newState = {
				...newState,
				importers: {
					...newState.importers,
					[ action.importerId ]: {
						...getImporterItemById( newState, action.importerId ),
						importerState: appStates.UPLOADING,
						filename: action.filename,
					},
				},
			};
			break;
	}

	newState = adjustImporterLock( newState, payload );

	return newState;
}, initialState );

export function getState() {
	return ImporterStore.get();
}

export default ImporterStore;
