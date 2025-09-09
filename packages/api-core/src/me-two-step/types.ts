export interface UserSecurityKeys {
	registrations: {
		id: string;
		name: string;
		rp_id: string;
	}[];
}

export interface SecurityKeyRegistrationChallenge {
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

export interface DeleteSecurityKeyArgs {
	credential_id: string;
}

export interface SecurityKeyRegistrationChallengeArgs {
	hostname?: string;
}

export interface ValidateSecurityKeyRegistrationArgs {
	data: string;
	name: string;
	hostname?: string;
}
