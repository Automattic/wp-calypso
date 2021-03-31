/**
 * Internal dependencies
 */
import { getEmailForwardsCount } from 'calypso/lib/domains/email-forwarding/get-email-forwards-count';

export function hasEmailForwards( domain ) {
	return getEmailForwardsCount( domain ) > 0;
}
