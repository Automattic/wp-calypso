/**
 * Internal dependencies
 */
import { LOGIN_FORM_UPDATE } from 'state/action-types';
import 'state/data-layer/wpcom/login-2fa';
import 'state/data-layer/wpcom/users/auth-options';

import 'state/login/init';

export { loginUser } from 'state/login/actions/login-user';
export { updateNonce } from 'state/login/actions/update-nonce';
export { loginUserWithSecurityKey } from 'state/login/actions/login-user-with-security-key';
export { loginUserWithTwoFactorVerificationCode } from 'state/login/actions/login-user-with-two-factor-verification-code';
export { loginSocialUser } from 'state/login/actions/login-social-user';
export { createSocialUser } from 'state/login/actions/create-social-user';
export { connectSocialUser } from 'state/login/actions/connect-social-user';
export { disconnectSocialUser } from 'state/login/actions/disconnect-social-user';
export { createSocialUserFailed } from 'state/login/actions/create-social-user-failed';
export { sendSmsCode } from 'state/login/actions/send-sms-code';
export {
	receivedTwoFactorPushNotificationApproved,
	startPollAppPushAuth,
	stopPollAppPushAuth,
} from 'state/login/actions/push';
export { getAuthAccountType, resetAuthAccountType } from 'state/login/actions/auth-account-type.js';

export const formUpdate = () => ( { type: LOGIN_FORM_UPDATE } );
