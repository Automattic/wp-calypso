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
	agency_id: number | undefined;
	site?: string;
	no_of_sites?: number;
	contact_type?: string;
	pressable_id?: number;
	tags?: string[];
}
