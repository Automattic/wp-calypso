/**
 * Internal dependencies
 */
import { EDITOR_CUSTOM_INITIAL_BLOCK_SET } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const gutenbergOptInOut = ( state, { type, customInitialBlock } ) =>
	type === EDITOR_CUSTOM_INITIAL_BLOCK_SET ? customInitialBlock : state;

export default keyedReducer( 'siteId', gutenbergOptInOut );
