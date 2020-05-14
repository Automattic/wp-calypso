/**
 * External dependencies
 */
import { get } from 'lodash';

/*@__INLINE__*/
export default ( state, siteId ) => {
	return get( state, [ 'atomicTransfer', siteId, 'atomicTransfer' ], {} );
};
