/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { JETPACK_PRODUCT_INSTALL_STATUS_RECEIVE } from 'calypso/state/action-types';
import { withStorageKey } from 'calypso/state/utils';

const reducer = keyedReducer( 'siteId', ( state = {}, { type, status } ) => {
	switch ( type ) {
		case JETPACK_PRODUCT_INSTALL_STATUS_RECEIVE:
			return status;
		default:
			return state;
	}
} );

export default withStorageKey( 'jetpackProductInstall', reducer );
