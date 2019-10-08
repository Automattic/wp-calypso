/**
 * Internal dependencies
 */
import { GUTENBERG_OPT_IN_OUT_SET } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const gutenbergOptInOut = ( state, { type, optIn, optOut } ) =>
	type === GUTENBERG_OPT_IN_OUT_SET ? { optIn, optOut } : state;

export default keyedReducer( 'siteId', gutenbergOptInOut );
