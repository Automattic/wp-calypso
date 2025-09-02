export interface AccountRecovery {
	email: string;
	email_validated: boolean;
	phone: string;
	phone_validated: boolean;
}

export interface AccountRecoverySuccess {
	success: true;
}
