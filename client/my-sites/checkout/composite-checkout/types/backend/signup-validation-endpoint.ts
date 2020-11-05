/**
 * Request parameter expected by the domain contact validation endpoint.
 *
 * @see WPCOM_JSON_API_Signups_Validation_User_Endpoint
 */

export type SignupValidationResponse = {
	success: boolean;
	messages: {
		first_name?: string[];
		last_name?: string[];
		email?: Record< string, string >;
		username?: string[];
		password?: string[];
	};
};
