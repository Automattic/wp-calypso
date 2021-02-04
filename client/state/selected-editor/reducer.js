/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_SET } from 'calypso/state/action-types';
import { withStorageKey } from 'calypso/state/utils';

export const selectedEditor = ( state, { type, editor } ) =>
	type === EDITOR_TYPE_SET ? editor : state;

export default withStorageKey( 'selectedEditor', keyedReducer( 'siteId', selectedEditor ) );
