/**
 * Internal dependencies
 */
import { keyedReducer } from 'calypso/state/utils';
import {
	PLUGINS_RECOMMENDED_RECEIVE,
	PLUGINS_RECOMMENDED_REQUEST_FAILURE,
} from 'calypso/state/action-types';

const reducer = keyedReducer( 'siteId', ( state = null, action ) => {
	switch ( action.type ) {
		case PLUGINS_RECOMMENDED_RECEIVE: {
			return action.data;
		}
		case PLUGINS_RECOMMENDED_REQUEST_FAILURE: {
			return state || [];
		}
	}
	return state;
} );

export default reducer;
