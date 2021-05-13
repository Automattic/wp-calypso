/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { GUTENBERG_IFRAME_ELIGIBLE_SET } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const gutenbergIframeEligible = ( state, { type, isEligibleForGutenframe } ) =>
	type === GUTENBERG_IFRAME_ELIGIBLE_SET ? isEligibleForGutenframe : state;

const reducer = keyedReducer( 'siteId', gutenbergIframeEligible );

export default withStorageKey( 'gutenbergIframeEligible', reducer );
