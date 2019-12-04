/**
 * Internal dependencies
 */

import { withoutPersistence } from 'state/utils';
import { READER_EXPAND_CARD, READER_RESET_CARD_EXPANSIONS } from 'state/action-types';
import { keyToString } from 'reader/post-key';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_EXPAND_CARD: {
			if ( ! action.payload.postKey ) {
				return state;
			}

			const { postKey } = action.payload;

			return {
				...state,
				[ keyToString( postKey ) ]: true,
			};
		}
		case READER_RESET_CARD_EXPANSIONS:
			return {};
	}

	return state;
} );
