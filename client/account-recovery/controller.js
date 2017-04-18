/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AccountRecoveryRoot from 'account-recovery/account-recovery-root';

export const accountRecoveryRoot = ( context, next ) => {
	context.primary = (
		<AccountRecoveryRoot
			basePath={ context.path }
			slug={ 'lostPassword' }
		/>
	);
	next();
};
