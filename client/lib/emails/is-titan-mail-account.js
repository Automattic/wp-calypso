/**
 * Internal dependencies
 */
import {
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
} from './email-provider-constants';

export function isTitanMailAccount( emailAccount ) {
	return [ EMAIL_ACCOUNT_TYPE_TITAN_MAIL, EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL ].includes(
		emailAccount.account_type
	);
}
