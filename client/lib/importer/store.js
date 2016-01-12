/**
 * External dependencies
 */
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import { fromApi } from './common';
import { actionTypes, appStates } from './constants';
import { createReducerStore } from 'lib/store';

/**
 * Module variables
 */
const initialState = Immutable.fromJS( {
	count: 0,
	importers: {},
	api: {
		isHydrated: false,
		isFetching: false,
		retryCount: 0
	}
} );

const increment = a => a + 1;

const ImporterStore = createReducerStore( function( state, payload ) {
	let { action } = payload,
		newState;

	switch ( action.type ) {
		case actionTypes.RESET_STORE:
			return initialState;

		case actionTypes.DEV_SET_STATE:
			// Convert the importer list into an object
			action.newState.importers = action.newState.importers
					.reduce( ( total, importer ) => Object.assign( total, { [ importer.id ]: importer } ), {} );

			newState = Immutable.fromJS( action.newState );
			newState = Immutable.is( state, newState ) ? state : newState;
			break;

		case actionTypes.API_REQUEST:
			newState = state.setIn( [ 'api', 'isFetching' ], true );
			break;

		case actionTypes.API_FAILURE:
			newState = state
				.setIn( [ 'api', 'isFetching' ], false )
				.updateIn( [ 'api', 'retryCount' ], increment );
			break;

		case actionTypes.API_SUCCESS:
			newState = state
				.setIn( [ 'api', 'isFetching' ], false )
				.setIn( [ 'api', 'isHydrated' ], true )
				.setIn( [ 'api', 'retryCount' ], 0 );
			break;

		case actionTypes.CANCEL_IMPORT:
		case actionTypes.RESET_IMPORT:
			// Remove the specified importer from the list of current importers
			newState = state.update( 'importers', importers => {
				return importers.filterNot( importer => importer.get( 'id' ) === action.importerId );
			} );
			break;

		case actionTypes.FAIL_UPLOAD:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.UPLOAD_FAILURE )
				.setIn( [ 'importers', action.importerId, 'errorData' ], { type: 'uploadError', description: action.error } );
			break;

		case actionTypes.FINISH_UPLOAD:
			newState = state
				.deleteIn( [ 'importers' ], action.importerId )
				.setIn( [ 'importers', fromApi( action.importerStatus ).importerId ], Immutable.fromJS( fromApi( action.importerStatus ) ) );
			break;

		case actionTypes.START_MAPPING_AUTHORS:
			newState = state.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.MAP_AUTHORS );
			break;

		case actionTypes.MAP_AUTHORS:
			newState = state.updateIn( [ 'importers', action.importerId, 'customData', 'sourceAuthors' ], authors => (
				authors.map( author => {
					if ( action.sourceAuthor.id !== author.get( 'id' ) ) {
						return author;
					}

					return author.set( 'mappedTo', action.targetAuthor );
				} )
			) );
			break;

		case actionTypes.RECEIVE_IMPORT_STATUS:
			newState = state
				.setIn( [ 'api', 'isHydrated' ], true );

			if ( action.importerStatus.importerState === appStates.DEFUNCT ) {
				break;
			}

			newState = newState
				.setIn( [ 'importers', action.importerStatus.importerId ], Immutable.fromJS( action.importerStatus ) );
			break;

		case actionTypes.SET_UPLOAD_PROGRESS:
			newState = state.setIn( [ 'importers', action.importerId, 'percentComplete' ],
				action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) * 100
			);
			break;

		case actionTypes.START_IMPORT:
			const newImporter = Immutable.fromJS( {
				id: action.importerId,
				type: action.importerType,
				importerState: appStates.READY_FOR_UPLOAD,
				site: { ID: action.siteId }
			} );

			newState = state
				.update( 'count', count => count + 1 )
				.setIn( [ 'importers', action.importerId ], newImporter );
			break;

		case actionTypes.START_IMPORTING:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.UPLOADING );
			break;

		case actionTypes.START_UPLOAD:
			newState = state
				.setIn( [ 'importers', action.importerId, 'importerState' ], appStates.UPLOADING )
				.setIn( [ 'importers', action.importerId, 'filename' ], action.filename );
			break;

		default:
			newState = state;
			break;
	}

	return newState;
}, initialState );

export function getState() {
	return ImporterStore.get().toJS();
}

export default ImporterStore;
