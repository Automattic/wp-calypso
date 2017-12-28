/** @format */

/**
 * Internal dependencies
 */

import { EMAIL_VERIFY_REQUEST, EMAIL_VERIFY_STATE_RESET } from 'client/state/action-types';

export const verifyEmail = () => ( { type: EMAIL_VERIFY_REQUEST } );

export const resetVerifyEmailState = () => ( { type: EMAIL_VERIFY_STATE_RESET } );
