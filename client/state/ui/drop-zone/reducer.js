/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import {
	stubTrue,
	stubFalse,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	DROPZONE_SHOW,
	DROPZONE_HIDE
} from 'state/action-types';

import { createReducer } from 'state/utils';

const isVisible = createReducer( false,
	{
		[ DROPZONE_SHOW ]: stubTrue,
		[ DROPZONE_HIDE ]: stubFalse,
	}
);

export default combineReducers( {
	isVisible,
} );
