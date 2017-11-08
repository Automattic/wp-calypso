/** @format */

/**
 * Internal dependencies
 */
import { keyedReducer, combineReducers } from 'state/utils';
import { itemsSchema } from './schema';
import { READER_STREAMS_PAGE_RECEIVE, READER_STREAMS_SELECT_ITEM } from 'state/action-types';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';

export const items = keyedReducer(
	'payload.streamId',
	( state = [], action ) => {
		switch ( action.type ) {
			case READER_STREAMS_PAGE_RECEIVE:
				const { posts } = action.payload;

				// if action doesnt have any posts then exit
				if ( ! posts ) {
					return state;
				}

				// if state didnt exist before now, then the list of postKeys is good enough
				if ( ! state ) {
					return posts;
				}

				return state.concat( posts );
			default:
				return state;
		}
	},
	[ SERIALIZE, DESERIALIZE ]
);

items.schema = itemsSchema;

export const selected = keyedReducer(
	'payload.streamId',
	( state = [], action ) => {
		switch ( action.type ) {
			case READER_STREAMS_SELECT_ITEM:
				return action.payload.index;
			default:
				return state;
		}
	},
	[ SERIALIZE, DESERIALIZE ]
);

export default combineReducers( {
	items,
	selected,
} );
