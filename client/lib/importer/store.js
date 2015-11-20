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
const initialState = {
	count: 0,
	importers: new Immutable.Map
};

const ImporterStore = createReducerStore( function( state, payload ) {
	let { action } = payload,
		newState;

	switch ( action.type ) {
		case actionTypes.DEV_SET_STATE:
			// Convert the importer list into an object
			action.newState.importers = action.newState.importers
					.reduce( ( total, importer ) => Object.assign( total, { [ importer.id ]: importer } ), {} );

			newState = Immutable.fromJS( action.newState );
			newState = Immutable.is( state, newState ) ? state : newState;
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

		case actionTypes.SET_UPLOAD_PROGRESS:
			newState = state.setIn( [ 'importers', action.importerId, 'percentComplete' ],
				action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) * 100
			);
			break;

		case actionTypes.START_IMPORT:
			let newImporter = Immutable.fromJS( {
				id: action.importerId,
				type: action.importerType,
				importerState: appStates.READY_FOR_UPLOAD
			} );

			newState = state
				.update( 'count', count => count + 1 )
				.setIn( [ 'importers', action.importerId ], Immutable.fromJS( newImporter ) );
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
}, Immutable.fromJS( initialState ) );

export function getState() {
	return ImporterStore.get().toJS();
}

export default ImporterStore;
