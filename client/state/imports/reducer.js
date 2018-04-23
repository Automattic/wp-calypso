/** @format */

/**
 * External dependencies
 */
import { flow, curry, omit, omitBy, includes, get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	IMPORTS_STORE_RESET,
	IMPORTS_FETCH,
	IMPORTS_FETCH_FAILED,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_IMPORT_START,
	IMPORTS_START_IMPORTING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_UPLOAD_START,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_UNLOCK,
} from 'state/action-types';
import { appStates } from 'state/imports/constants';

/**
 * The inital state of the imports store
 *
 * @type {Object}
 */
const initialState = {
	count: 0,
	importers: {},
	importerLocks: {},
	api: {
		isHydrated: false,
		isFetching: false,
		retryCount: 0,
	},
};

/**
 * Increment the count property of the store state.
 *
 * @param {Object} state The state of the redux store
 * @returns {Object} state The updated state with count incremented by 1
 */
const incrementCount = state => ( { ...state, count: state.count + 1 } );

/**
 * Merge an update into the api property of the store.
 *
 * @param {Object} apiUpdate The object to merge into the api object
 * @returns {Object} The updated state with api changes
 */
const mergeApiUpdate = curry( ( apiUpdate, state ) => ( {
	...state,
	api: {
		...state.api,
		...apiUpdate,
	},
} ) );

/**
 * Add a new importer to the object containing imports. If an importer already
 * exists with the same id, this will overwrite it.
 *
 * @param {string} importerId The id of the importer
 * @param {Object} importer The importer
 * @param {Object} state The current redux store state
 * @returns {Object} The updated state with the new importer added
 */
const createImporter = curry( ( importerId, importer, state ) => ( {
	...state,
	importers: {
		...state.importers,
		[ importerId ]: importer,
	},
} ) );

/**
 * Merge an update into the importer with the given id.
 *
 * @param {string} importerId The id of the importer to update
 * @param {Object} importerUpdate An object containing the properties to update
 * @param {Object} state The current redux store state
 * @returns {Object} The updated state with the merged update
 */
const mergeImporterUpdate = curry( ( importerId, importerUpdate, state ) => ( {
	...state,
	importers: {
		...state.importers,
		[ importerId ]: {
			...state.importers[ importerId ],
			...importerUpdate,
		},
	},
} ) );

/**
 * Remove an importer with the provided id.
 *
 * @param {Object} importerId The id of the importer to remove
 * @param {Object} state The current redux store state
 * @returns {Object} The updated state without the removed importer
 */
const deleteImporter = curry( ( importerId, state ) => ( {
	...state,
	importers: omit( state.importers, importerId ),
} ) );

/**
 * importerStates that can be removed by the `deleteRemovableImporters` function
 *
 * @type {Array}
 */
const removableStates = [ appStates.CANCEL_PENDING, appStates.DEFUNCT ];

/**
 * Remove any importers at the states within the `removeableStates` array.
 *
 * @param {Object} state The current redux store state
 * @returns {Object} The updated state without the removed importers
 */
const deleteRemovableImporters = state => ( {
	...state,
	importers: omitBy( state.importers, importer =>
		includes( removableStates, importer.importerState )
	),
} );

/**
 * Returns the updated items state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export default createReducer( initialState, {
	[ IMPORTS_STORE_RESET ]: () => initialState,
	[ IMPORTS_FETCH ]: mergeApiUpdate( {
		isFetching: true,
	} ),
	[ IMPORTS_FETCH_FAILED ]: state =>
		mergeApiUpdate(
			{
				isFetching: false,
				retryCount: state.api.retryCount + 1,
			},
			state
		),
	[ IMPORTS_FETCH_COMPLETED ]: mergeApiUpdate( {
		isHydrated: true,
		isFetching: false,
		retryCount: 0,
	} ),
	[ IMPORTS_IMPORT_START ]: ( state, { importerId, importerType, siteId } ) =>
		flow(
			incrementCount,
			createImporter( importerId, {
				importerId,
				type: importerType,
				importerState: appStates.READY_FOR_UPLOAD,
				site: { ID: siteId },
			} )
		)( state ),
	[ IMPORTS_START_IMPORTING ]: ( state, { importerId } ) =>
		mergeImporterUpdate(
			importerId,
			{
				importerState: appStates.IMPORTING,
			},
			state
		),
	[ IMPORTS_IMPORT_CANCEL ]: ( state, { importerId } ) => deleteImporter( importerId, state ),
	[ IMPORTS_IMPORT_RESET ]: ( state, { importerId } ) => deleteImporter( importerId, state ),
	[ IMPORTS_IMPORT_RECEIVE ]: ( state, { importerStatus } ) => {
		const importerId = importerStatus.importerId;
		const updatedState = mergeApiUpdate(
			{
				isHydrated: true,
			},
			state
		);

		if ( state.importerLocks[ importerId ] ) {
			return updatedState;
		}

		if ( importerStatus.importerState === appStates.DEFUNCT ) {
			return deleteImporter( importerId, updatedState );
		}

		return flow( deleteRemovableImporters, createImporter( importerId, importerStatus ) )(
			updatedState
		);
	},
	[ IMPORTS_UPLOAD_START ]: ( state, { importerId, filename } ) =>
		mergeImporterUpdate(
			importerId,
			{
				importerState: appStates.UPLOADING,
				filename,
			},
			state
		),
	[ IMPORTS_UPLOAD_FAILED ]: ( state, { importerId, error } ) =>
		mergeImporterUpdate(
			importerId,
			{
				importerState: appStates.UPLOAD_FAILURE,
				errorData: {
					type: 'uploadError',
					description: error,
				},
			},
			state
		),
	[ IMPORTS_UPLOAD_SET_PROGRESS ]: ( state, { importerId, uploadLoaded, uploadTotal } ) =>
		mergeImporterUpdate(
			importerId,
			{
				percentComplete: uploadLoaded / ( uploadTotal + Number.EPSILON ) * 100,
			},
			state
		),
	[ IMPORTS_UPLOAD_COMPLETED ]: ( state, { importerId, importerStatus } ) =>
		flow(
			deleteImporter( importerId ),
			createImporter( importerStatus.importerId, importerStatus )
		)( state ),
	[ IMPORTS_AUTHORS_START_MAPPING ]: ( state, { importerId } ) =>
		mergeImporterUpdate(
			importerId,
			{
				importerState: appStates.MAP_AUTHORS,
			},
			state
		),
	[ IMPORTS_AUTHORS_SET_MAPPING ]: ( state, { importerId, sourceAuthor, targetAuthor } ) => {
		const authors = get( state, [ 'importers', importerId, 'customData', 'sourceAuthors' ] );

		if ( ! authors ) {
			return state;
		}

		const mappedAuthors = authors.map( author => {
			if ( author.id !== sourceAuthor.id ) {
				return author;
			}

			return {
				...author,
				mappedTo: targetAuthor,
			};
		} );

		return mergeImporterUpdate(
			importerId,
			{
				customData: {
					...state.importers[ importerId ].customData,
					sourceAuthors: mappedAuthors,
				},
			},
			state
		);
	},
	[ IMPORTS_IMPORT_LOCK ]: ( state, { importerId } ) => ( {
		...state,
		importerLocks: {
			...state.importerLocks,
			[ importerId ]: true,
		},
	} ),
	[ IMPORTS_IMPORT_UNLOCK ]: ( state, { importerId } ) => ( {
		...state,
		importerLocks: {
			...state.importerLocks,
			[ importerId ]: false,
		},
	} ),
} );
