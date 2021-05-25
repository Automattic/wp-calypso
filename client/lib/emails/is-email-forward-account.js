/**
 * Internal dependencies
 */
import { EMAIL_ACCOUNT_TYPE_FORWARD } from './email-provider-constants';

export function isEmailForwardAccount( emailAccount ) {
	return emailAccount?.account_type === EMAIL_ACCOUNT_TYPE_FORWARD;
}
