export interface AccountRecovery {
	email: string;
	email_validated: boolean;
	phone: {
		country_code: string;
		country_numeric_code: string;
		number: string;
		number_full: string;
	} | null;
	phone_validated: boolean;
}

export interface AccountRecoverySuccess {
	success: true;
}
