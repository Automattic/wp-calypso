/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	DROPZONE_SHOW,
	DROPZONE_HIDE
} from 'state/action-types';

import { createReducer } from 'state/utils';

const isVisible = createReducer( {},
	{
		[ DROPZONE_SHOW ]: ( state, { dropZoneName } ) => ( {
			...state,
			[ dropZoneName ]: true,
		} ),
		[ DROPZONE_HIDE ]: ( state, { dropZoneName } ) => ( {
			...state,
			[ dropZoneName ]: false,
		} ),
	}
);

export default combineReducers( {
	isVisible,
} );
