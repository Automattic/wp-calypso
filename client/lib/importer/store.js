/**
 * External dependencies
 */
import { get, includes, map, omit, omitBy } from 'lodash';

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

const ImporterStore = createReducerStore( function ( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case IMPORTS_STORE_RESET:
			// this is here to enable
			// unit-testing the store
			return initialState;

		case IMPORTS_FETCH:
			return {
				...state,
				api: {
					...state.api,
					isFetching: true,
				},
			};

		case IMPORTS_FETCH_FAILED:
			return {
				...state,
				api: {
					...state.api,
					isFetching: false,
					retryCount: get( state, 'api.retryCount', 0 ) + 1,
				},
			};

		case IMPORTS_FETCH_COMPLETED:
			return {
				...state,
				api: {
					...state.api,
					isFetching: false,
					isHydrated: true,
					retryCount: 0,
				},
			};

		case IMPORTS_IMPORT_CANCEL:
		case IMPORTS_IMPORT_RESET:
			return {
				...state,
				importers: omit( state.importers, action.importerId ),
			};

		case IMPORTS_UPLOAD_FAILED: {
			const { importerId } = action;
			const importerItem = getImporterItemById( state, importerId );

			return {
				...state,
				importers: {
					...state.importers,
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
		}
		case IMPORTS_UPLOAD_COMPLETED:
			return {
				...state,
				importers: {
					...omit( state.importers, action.importerId ),
					[ action.importerStatus.importerId ]: action.importerStatus,
				},
			};

		case IMPORTS_AUTHORS_START_MAPPING: {
			const { importerId } = action;
			const importerItem = getImporterItemById( state, importerId );

			return {
				...state,
				importers: {
					...state.importers,
					[ importerId ]: {
						...importerItem,
						importerState: appStates.MAP_AUTHORS,
					},
				},
			};
		}
		case IMPORTS_AUTHORS_SET_MAPPING: {
			const { importerId, sourceAuthor, targetAuthor } = action;
			const importerItem = getImporterItemById( state, importerId );

			return {
				...state,
				importers: {
					...state.importers,
					[ importerId ]: {
						...importerItem,
						customData: {
							...importerItem.customData,
							sourceAuthors: map( get( importerItem, 'customData.sourceAuthors' ), ( author ) =>
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
			};
		}
		case IMPORTS_IMPORT_RECEIVE: {
			const newState = {
				...state,
				api: {
					...state.api,
					isHydrated: true,
				},
			};
			const importerId = get( action, 'importerStatus.importerId' );

			if ( get( newState, [ 'importerLocks', importerId ] ) ) {
				return newState;
			}

			const activeImporters = omitBy(
				{
					// filter the original set of importers...
					...newState.importers,
					// ...and the importer being received.
					[ importerId ]: action.importerStatus,
				},
				( importer ) =>
					includes( [ appStates.CANCEL_PENDING, appStates.DEFUNCT ], importer.importerState )
			);

			return {
				...newState,
				importers: activeImporters,
			};
		}
		case IMPORTS_UPLOAD_SET_PROGRESS:
			return {
				...state,
				importers: {
					...state.importers,
					[ action.importerId ]: {
						...getImporterItemById( state, action.importerId ),
						percentComplete:
							( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100,
					},
				},
			};

		case IMPORTS_IMPORT_START:
			return {
				...state,
				count: get( state, 'count', 0 ) + 1,
				importers: {
					...state.importers,
					[ action.importerId ]: {
						importerId: action.importerId,
						importerState: appStates.READY_FOR_UPLOAD,
						site: { ID: action.siteId },
						type: action.importerType,
					},
				},
			};

		case IMPORTS_START_IMPORTING:
			return {
				...state,
				importers: {
					...state.importers,
					[ action.importerId ]: {
						...getImporterItemById( state, action.importerId ),
						importerState: appStates.IMPORTING,
					},
				},
			};

		case IMPORTS_UPLOAD_START:
			return {
				...state,
				importers: {
					...state.importers,
					[ action.importerId ]: {
						...getImporterItemById( state, action.importerId ),
						importerState: appStates.UPLOADING,
						filename: action.filename,
					},
				},
			};

		case IMPORTS_IMPORT_LOCK:
			return {
				...state,
				importerLocks: {
					...state.importerLocks,
					[ action.importerId ]: true,
				},
			};

		case IMPORTS_IMPORT_UNLOCK:
			return {
				...state,
				importerLocks: {
					...state.importerLocks,
					[ action.importerId ]: false,
				},
			};
	}

	return state;
}, initialState );

export function getState() {
	return ImporterStore.get();
}

export default ImporterStore;
