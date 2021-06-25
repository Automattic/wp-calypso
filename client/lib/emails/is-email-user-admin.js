/**
 * Internal dependencies
 */
import { EMAIL_USER_ROLE_ADMIN } from './email-provider-constants';

export function isEmailUserAdmin( emailUser ) {
	return EMAIL_USER_ROLE_ADMIN === emailUser?.role;
}
