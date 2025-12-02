import { EmailSubscription } from '@automattic/api-core';

export function getExpiryDate( emailSubscription?: EmailSubscription ) {
	return emailSubscription?.expiry_date;
}
