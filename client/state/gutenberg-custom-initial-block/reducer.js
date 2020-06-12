/**
 * Internal dependencies
 */
import { EDITOR_CUSTOM_INITIAL_BLOCK_SET } from 'state/action-types';
import { keyedReducer, withStorageKey } from 'state/utils';

const gutenbergOptInOut = ( state, { type, customInitialBlock } ) =>
	type === EDITOR_CUSTOM_INITIAL_BLOCK_SET ? customInitialBlock : state;

export default withStorageKey(
	'gutenbergCustomInitialBlock',
	keyedReducer( 'siteId', gutenbergOptInOut )
);
