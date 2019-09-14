/**
 * Internal dependencies
 */
import { combineReducers, createReducerWithValidation } from 'state/utils';
import { LOCALE_SET } from 'state/action-types';
import { localeSlugSchema, localeVariantSchema, isRtlSchema } from './schema';
import { getLanguage } from 'lib/i18n-utils/utils';

/**
 * Tracks the state of the ui locale
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const localeSlug = createReducerWithValidation(
	null,
	{
		[ LOCALE_SET ]: ( state, action ) => action.localeSlug,
	},
	localeSlugSchema
);

/**
 * Tracks the state of the ui locale variant
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated or default state
 *
 */
export const localeVariant = createReducerWithValidation(
	null,
	{
		[ LOCALE_SET ]: ( state, action ) => action.localeVariant || state,
	},
	localeVariantSchema
);

/**
 * Tracks the state of the ui language isRtl.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const isRtl = createReducerWithValidation(
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

export default combineReducers( { localeSlug, localeVariant, isRtl } );
