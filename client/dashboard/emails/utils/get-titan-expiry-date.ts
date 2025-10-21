import { Domain } from '@automattic/api-core';

export function getTitanExpiryDate( domain: Domain ) {
	return domain.titan_mail_subscription?.expiry_date;
}
