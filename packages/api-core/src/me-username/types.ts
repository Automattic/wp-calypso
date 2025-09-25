export interface UsernameValidationResult {
	success?: boolean;
	error?: string;
	message?: string;
	allowed_actions?: Record< string, string >;
	validatedUsername?: string;
}

export interface UsernameChangeResult {
	success: boolean;
	message?: string;
}
