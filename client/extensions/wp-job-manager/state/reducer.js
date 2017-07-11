/**
 * External dependencies
 */
import { reducer as formReducer } from 'redux-form';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import pages from './pages/reducer';
import settings from './settings/reducer';

export default combineReducers( {
	form: formReducer,
	pages,
	settings,
} );
