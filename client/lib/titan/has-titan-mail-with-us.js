/**
 * External dependencies
 */
import { get } from 'lodash';

export function hasTitanMailWithUs( domain ) {
	const domainStatus = get( domain, 'titanMailSubscription.status', '' );
	return domainStatus === 'active';
}
