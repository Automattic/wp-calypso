/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'client/state/utils';
import { LOCALE_SET } from 'client/state/action-types';
import { localeSlugSchema } from './schema';

/**
 * Tracks the state of the ui locale
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const localeSlug = createReducer(
	null,
	{
		[ LOCALE_SET ]: ( state, action ) => action.localeSlug,
	},
	localeSlugSchema
);

export default combineReducers( { localeSlug } );
