/**
 * WordPress dependencies
 */

import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */

import blocksReducer from './blocks/reducer';
import blockActions from './blocks/actions';
import editorReducer from './editor/reducer';
import editorActions from './editor/actions';
import preferencesReducer from './preferences/reducer';
import preferenceActions from './preferences/actions';
import optionsReducer from './options/reducer';
import optionActions from './options/actions';
import * as blockSelectors from './blocks/selectors';
import * as editorSelectors from './editor/selectors';
import * as preferenceSelectors from './preferences/selectors';
import * as optionSelectors from './options/selectors';

function storeConfig( preferencesKey, defaultPreferences ) {
	return {
		reducer: combineReducers( {
			blocks: blocksReducer,
			editor: editorReducer,
			preferences: preferencesReducer,
			options: optionsReducer,
		} ),

		actions: {
			...blockActions,
			...editorActions,
			...optionActions,
			...preferenceActions,
		},

		selectors: {
			...blockSelectors,
			...editorSelectors,
			...preferenceSelectors,
			...optionSelectors,
		},

		persist: [ 'preferences' ],

		initialState: {
			preferences:
				preferencesKey && window?.localStorage?.getItem( preferencesKey )
					? JSON.parse( window?.localStorage?.getItem( preferencesKey ) )
					: defaultPreferences,
		},
	};
}

export default storeConfig;
