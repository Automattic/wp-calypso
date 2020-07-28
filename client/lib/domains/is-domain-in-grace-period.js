/**
 * External dependencies
 */
import moment from 'moment';

export function isDomainInGracePeriod( domain ) {
	return moment().subtract( 18, 'days' ) <= moment( domain?.expiry );
}
