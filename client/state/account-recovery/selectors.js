/**
 * Internal dependencies
 */
import 'state/account-recovery/init';

export const isFetchingAccountRecoverySettings = ( state ) =>
	state.accountRecovery.isFetchingSettings;
