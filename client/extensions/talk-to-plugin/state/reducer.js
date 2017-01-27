/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	OPTIONS_RECEIVE
} from 'state/action-types';
import { createReducer } from 'state/utils';

const createItemsReducer = () => {
	return ( state, { siteId, options } ) => {
		return merge( {}, state, {
			[ siteId ]: options
		} );
	};
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack settings updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ OPTIONS_RECEIVE ]: createItemsReducer()
} );
