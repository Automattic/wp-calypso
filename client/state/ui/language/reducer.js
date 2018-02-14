/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
import { LOCALE_SET } from 'state/action-types';
import { localeSlugSchema, isRtlSchema } from './schema';
import { getLanguage } from 'lib/i18n-utils/utils';

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

/**
 * Tracks the state of the ui language isRtl.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const isRtl = createReducer(
	null,
	{
		[ LOCALE_SET ]: ( state, action ) => {
			const localeSlugFromAction = action.localeSlug;

			if ( ! localeSlugFromAction ) {
				return null;
			}

			const language = getLanguage( localeSlugFromAction );

			if ( ! language ) {
				return null;
			}

			return Boolean( language.rtl );
		},
	},
	isRtlSchema
);

export default combineReducers( { localeSlug, isRtl } );
