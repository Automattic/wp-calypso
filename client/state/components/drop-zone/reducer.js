/**
 * Internal dependencies
 */
import {
	DROPZONE_SHOW,
	DROPZONE_HIDE
} from 'state/action-types';

import { createReducer } from 'state/utils';

export default createReducer( {},
	{
		[ DROPZONE_SHOW ]: ( state = {} ) => {
			return {
				...state,
				isVisible: true
			};
		},
		[ DROPZONE_HIDE ]: ( state = {} ) => {
			return {
				...state,
				isVisible: false
			};
		},
	}
);
