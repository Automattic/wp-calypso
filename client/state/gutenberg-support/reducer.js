/**
 * Internal dependencies
 */
import { GUTENBERG_SUPPORT_SET } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const gutenbergSupport = ( state, { type, isGutenbergSupported } ) =>
	type === GUTENBERG_SUPPORT_SET ? isGutenbergSupported : state;

export default keyedReducer( 'siteId', gutenbergSupport );
