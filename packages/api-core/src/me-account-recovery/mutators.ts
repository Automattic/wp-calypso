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

export async function updateAccountRecoverySMS(
	countryCode: string,
	phoneNumber: string
): Promise< AccountRecoverySuccess > {
	return wpcom.req.post( '/me/account-recovery/phone', {
		country: countryCode,
		phone_number: phoneNumber,
	} );
}

export async function validateAccountRecoverySMSCode(
	code: string
): Promise< AccountRecoverySuccess > {
	return wpcom.req.post( '/me/account-recovery/phone/validation', {
		code: code.replace( /\s/g, '' ),
	} );
}

export async function removeAccountRecoverySMS(): Promise< AccountRecoverySuccess > {
	return wpcom.req.post( '/me/account-recovery/phone/delete' );
}

export async function resendAccountRecoverySMSValidation(): Promise< AccountRecoverySuccess > {
	return wpcom.req.post( '/me/account-recovery/phone/validation/new' );
}
