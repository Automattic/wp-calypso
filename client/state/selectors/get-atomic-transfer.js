/**
 * External dependencies
 */
import { get } from 'lodash';

export default ( state, siteId ) => {
	return get( state, [ 'atomicTransfer', siteId, 'atomicTransfer' ], {} );
};
