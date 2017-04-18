/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AccountRecoveryRoot from 'account-recovery/account-recovery-root';
import { ACCOUNT_RECOVERY_SLUGS as SLUGS } from 'account-recovery/constants';

export const accountRecoveryRoot = ( context, next ) => {
	context.primary = (
		<AccountRecoveryRoot
			basePath={ context.path }
			initialSlug={ SLUGS.LOST_PASSWORD }
		/>
	);
	next();
};
