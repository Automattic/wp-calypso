/**
 * Internal dependencies
 */
import { GUTENBERG_OPT_IN_OUT_SET } from 'state/action-types';
import { keyedReducer, withStorageKey } from 'state/utils';

export const gutenbergOptInOut = ( state, { type, optIn, optOut } ) =>
	type === GUTENBERG_OPT_IN_OUT_SET ? { optIn, optOut } : state;

const reducer = keyedReducer( 'siteId', gutenbergOptInOut );

export default withStorageKey( 'gutenbergOptInOut', reducer );
