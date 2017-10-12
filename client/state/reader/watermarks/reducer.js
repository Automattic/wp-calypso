/**
 *  format
 *
 * @format
 */

/**
 * External Dependencies
 */
// import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_RAISE_WATERMARK } from 'action-types';
import { createReducer } from 'state/utils';
import schema from './watermark-schema';

export const watermarks = createReducer(
	{},
	{
		[ READER_RAISE_WATERMARK ]: ( state, action ) => {
			return null;
		},
	},
	schema
);
