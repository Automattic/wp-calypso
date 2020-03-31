/**
 * Internal dependencies
 */
import { PRESENCE_META_SET } from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import { itemsSchema } from './schema';

const DEFAULT_STATE = {
	posts: {},
};

export const items = withSchemaValidation( itemsSchema, ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case PRESENCE_META_SET:
			return {
				...state,
				[ action.entity ]: {
					...state[ action.entity ],
					[ action.uid ]: action.meta,
				},
			};
	}

	return state;
} );

export default combineReducers( { items } );
