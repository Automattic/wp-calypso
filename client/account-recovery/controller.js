/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import AccountRecoveryRoot from 'client/account-recovery/account-recovery-root';
import { ACCOUNT_RECOVERY_STEPS as STEPS } from 'client/account-recovery/constants';

export const lostPassword = ( context, next ) => {
	context.primary = (
		<AccountRecoveryRoot basePath={ context.path } firstStep={ STEPS.LOST_PASSWORD } />
	);
	next();
};

export const forgotUsername = ( context, next ) => {
	context.primary = (
		<AccountRecoveryRoot basePath={ context.path } firstStep={ STEPS.FORGOT_USERNAME } />
	);
	next();
};

export const validateResetCode = ( context, next ) => {
	context.primary = (
		<AccountRecoveryRoot basePath={ context.path } firstStep={ STEPS.VALIDATE_RESET_CODE } />
	);
	next();
};
