/**
 * Internal dependencies
 */
import { GUTENBERG_OPT_IN_SET } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const gutenbergOptIn = ( state, { type, optIn } ) =>
	type === GUTENBERG_OPT_IN_SET ? optIn : state;

export default keyedReducer( 'siteId', gutenbergOptIn );
