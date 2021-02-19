/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/atomic-transfer/init';

export default ( state, siteId ) => {
	return get( state, [ 'atomicTransfer', siteId, 'atomicTransfer' ], {} );
};
