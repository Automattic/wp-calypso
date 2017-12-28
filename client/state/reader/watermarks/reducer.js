/** @format */

/**
 * External Dependencies
 */
import { max } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_VIEW_STREAM } from 'client/state/action-types';
import { createReducer, keyedReducer } from 'client/state/utils';
import schema from './watermark-schema';

export const watermarks = keyedReducer(
	'streamId',
	createReducer(
		{},
		{
			[ READER_VIEW_STREAM ]: ( state, action ) => max( [ +state, +action.mark ] ),
		},
		schema
	)
);

watermarks.hasCustomPersistence = true;
