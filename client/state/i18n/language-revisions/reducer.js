/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { I18N_SET_LANGUAGE_REVISIONS } from 'state/action-types';

export const items = createReducer(
	{},
	{
		[ I18N_SET_LANGUAGE_REVISIONS ]: ( state, { languageRevisions } ) => languageRevisions,
	}
);

export default combineReducers( {
	items,
} );
