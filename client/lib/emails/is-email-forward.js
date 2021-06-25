/**
 * Internal dependencies
 */
import { EMAIL_TYPE_FORWARD } from './email-provider-constants';

export function isEmailForward( emailUser ) {
	return EMAIL_TYPE_FORWARD === emailUser.email_type;
}
