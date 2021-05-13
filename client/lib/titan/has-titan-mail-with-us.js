/**
 * External dependencies
 */
import { get } from 'lodash';

export function hasTitanMailWithUs( domain ) {
	const subscriptionStatus = get( domain, 'titanMailSubscription.status', '' );
	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}
