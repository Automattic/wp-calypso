/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	READER_EXPAND_CARD,
	READER_RESET_CARD_EXPANSIONS,
} from 'state/action-types';
import { keyToString } from 'lib/feed-stream-store/post-key';

export default createReducer( {}, {
	[ READER_EXPAND_CARD ]: ( state, action ) => {
		if ( ! action.payload.postKey ) {
			return state;
		}

		const { postKey } = action.payload;

		return {
			...state,
			[ keyToString( postKey ) ]: true,
		};
	},
	[ READER_RESET_CARD_EXPANSIONS ]: () => ( {} )
} );
