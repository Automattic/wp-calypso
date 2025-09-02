import wpcom from 'calypso/lib/wp';

export interface AccountRecovery {
	email: string;
	email_validated: boolean;
	phone: string;
	phone_validated: boolean;
}

export async function fetchAccountRecovery(): Promise< AccountRecovery > {
	return wpcom.req.get( '/me/account-recovery' );
}

// Email-related actions
export async function updateAccountRecoveryEmail( email: string ): Promise< AccountRecovery > {
	return wpcom.req.post( '/me/account-recovery/email', { email } );
}

export async function removeAccountRecoveryEmail(): Promise< AccountRecovery > {
	return wpcom.req.post( '/me/account-recovery/email/delete' );
}

export async function resendAccountRecoveryEmailValidation(): Promise< AccountRecovery > {
	return wpcom.req.post( '/me/account-recovery/email/validation/new' );
}
