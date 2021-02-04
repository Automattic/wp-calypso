/**
 * Internal dependencies
 */
import { WHATS_NEW_LIST_SET } from 'calypso/state/action-types';
import { withStorageKey } from 'calypso/state/utils';

export const list = ( state = {}, action ) =>
	action.type === WHATS_NEW_LIST_SET ? action.list : state;

export default withStorageKey( 'whats-new' );
