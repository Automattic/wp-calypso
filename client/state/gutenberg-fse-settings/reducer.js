import { withStorageKey } from '@automattic/state-utils';
import { GUTENBERG_FSE_SETTINGS_SET } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const gutenbergFSESettings = ( state, { type, isCoreFSEActive, isCoreFSEEligible } ) =>
	type === GUTENBERG_FSE_SETTINGS_SET ? { isCoreFSEActive, isCoreFSEEligible } : state;

const reducer = keyedReducer( 'siteId', gutenbergFSESettings );

export default withStorageKey( 'gutenbergFSESettings', reducer );
