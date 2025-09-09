import { wpcom } from '../wpcom-fetcher';
import type { AccountRecovery, AccountRecoverySuccess } from './types';

export async function updateAccountRecoveryEmail( email: string ): Promise< AccountRecovery > {
	return wpcom.req.post( '/me/account-recovery/email', { email } );
}

export async function removeAccountRecoveryEmail(): Promise< AccountRecoverySuccess > {
	return wpcom.req.post( '/me/account-recovery/email/delete' );
}

export async function resendAccountRecoveryEmailValidation(): Promise< AccountRecoverySuccess > {
	return wpcom.req.post( '/me/account-recovery/email/validation/new' );
}
