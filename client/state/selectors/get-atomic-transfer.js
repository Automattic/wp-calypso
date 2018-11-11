/** format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getAtomicTransfer = ( state, siteId ) => {
	return get( state, [ 'atomicTransfer', siteId ] , {} );
};
