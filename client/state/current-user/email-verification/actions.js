/**
 * Internal dependencies
 */

import { EMAIL_VERIFY_REQUEST, EMAIL_VERIFY_STATE_RESET } from 'state/action-types';

import 'state/data-layer/wpcom/me/send-verification-email';

export const verifyEmail = () => ( { type: EMAIL_VERIFY_REQUEST } );

export const resetVerifyEmailState = () => ( { type: EMAIL_VERIFY_STATE_RESET } );
