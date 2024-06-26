export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

export interface SubmitContactSupportParams {
	name: string;
	email: string;
	message: string;
	product: string;
	site?: string;
}
