export interface UserTwoStepAuthSecurityKeys {
	registrations: {
		id: string;
		name: string;
		rp_id: string;
	}[];
}

export interface TwoStepAuthSecurityKeyRegistrationChallenge {
	rp: {
		id: string;
		name: string;
	};
	user: {
		id: string;
		name: string;
		displayName: string;
	};
	challenge: string;
	pubKeyCredParams: {
		type: 'public-key';
		alg: number;
	}[];
	timeout: number;
}

export interface DeleteTwoStepAuthSecurityKeyArgs {
	credential_id: string;
}

export interface TwoStepAuthSecurityKeyRegistrationChallengeArgs {
	hostname?: string;
}

export interface ValidateTwoStepAuthSecurityKeyRegistrationArgs {
	data: string;
	name: string;
	hostname?: string;
}
export interface TwoStepAuthApplicationPassword {
	ID: string;
	name: string;
	generated: string;
}

export interface CreateTwoStepAuthApplicationPasswordArgs {
	application_name: string;
}

export interface CreateTwoStepAuthApplicationPasswordResponse {
	application_password: string;
}
export interface TwoStepAuthAppAuthSetup {
	otpauth_uri: string;
	time_code: string;
}

export interface ValidateTwoStepAuthCodeArgs {
	code: string;
	action: string;
}

export interface GenerateTwoStepAuthBackupCodesResponse {
	codes: string[];
}
