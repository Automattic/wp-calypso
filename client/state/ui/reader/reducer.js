/** @format */

/**
 * Internal dependencies
 */

import { READER_VIEW_STREAM } from 'state/action-types';
import sidebar from './sidebar/reducer';
import { combineReducers } from 'state/utils';
import cardExpansions from './card-expansions/reducer';

/*
 * Holds the last viewed stream for the purposes of keyboard navigation
 */
export const currentStream = ( state = null, action ) =>
	action.type === READER_VIEW_STREAM ? action.payload.streamKey : state;

export default combineReducers( {
	sidebar,
	cardExpansions,
	currentStream,
} );
