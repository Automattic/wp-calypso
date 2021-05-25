/**
 * Internal dependencies
 */
import {
	EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE,
	EMAIL_ACCOUNT_TYPE_GSUITE,
} from './email-provider-constants';

export function isGoogleEmailAccount( emailAccount ) {
	return [ EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE, EMAIL_ACCOUNT_TYPE_GSUITE ].includes(
		emailAccount?.account_type
	);
}
