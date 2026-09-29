import { wpcom } from './wpcom-fetcher';

export type SignupValidationResponse = {
	success: boolean;
	messages?: {
		first_name?: string[];
		last_name?: string[];
		/** Keyed by error code, for example `taken`. */
		email?: Record< string, string >;
		username?: string[];
		password?: string[];
	};
};

export interface ValidateSignupUserParams {
	email: string;
	locale?: string;
	is_from_registrationless_checkout?: boolean;
}

export async function validateSignupUser(
	params: ValidateSignupUserParams
): Promise< SignupValidationResponse > {
	return await wpcom.req.post( { path: '/signups/validation/user/', body: params } );
}
