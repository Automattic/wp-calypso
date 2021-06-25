/**
 * Internal dependencies
 */
import 'calypso/state/account-recovery/init';

export const isFetchingAccountRecoverySettings = ( state ) =>
	state.accountRecovery.isFetchingSettings;
