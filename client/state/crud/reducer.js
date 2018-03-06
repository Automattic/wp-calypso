/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'state/utils';
import { CRUD_REPLACE, CRUD_CREATE_OR_UPDATE, CRUD_DELETE, isCrudAction } from './actions';

export const itemsReducer = ( { path, getId = item => item.id, schema } ) => {
	const reducer = ( state = null, action ) => {
		if ( ! isCrudAction( action ) || action.path !== path ) {
			return state;
		}

		switch ( action.type ) {
			case CRUD_REPLACE:
				return action.items;

			case CRUD_CREATE_OR_UPDATE:
				if ( state === null ) {
					return [ action.item ];
				}

				let found = false;

				const newState = state.map( item => {
					if ( getId( item ) !== getId( action.item ) ) {
						return item;
					}

					found = true;
					return action.item;
				} );

				if ( ! found ) {
					newState.push( action.item );
				}

				return newState;

			case CRUD_DELETE:
				return state.filter( item => getId( item ) !== action.itemId );

			default:
				return state;
		}
	};

	return withSchemaValidation( schema, reducer );
};

export const lastUpdatedReducer = ( { path } ) => ( state = null, action ) => {
	if ( ! isCrudAction( action ) || action.path !== path ) {
		return state;
	}

	if ( action.type === CRUD_REPLACE ) {
		return Date.now();
	}

	return state;
};

export default options =>
	combineReducers( {
		items: itemsReducer( options ),
		lastUpdated: lastUpdatedReducer( options ),
	} );
