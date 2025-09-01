export interface AccountClosureResponse {
	success: boolean;
	token?: string;
}

export interface AccountClosureError {
	error: string;
	message: string;
}
