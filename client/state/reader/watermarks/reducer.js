/**
 * External Dependencies
 */
import { max } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_VIEW_STREAM } from 'state/action-types';
import { createReducerWithValidation, keyedReducer } from 'state/utils';
import schema from './watermark-schema';

export const watermarks = keyedReducer(
	'streamKey',
	createReducerWithValidation(
		{},
		{
			[ READER_VIEW_STREAM ]: ( state, action ) => max( [ +state, +action.mark ] ),
		},
		schema
	)
);

watermarks.hasCustomPersistence = true;
