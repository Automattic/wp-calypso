export interface UserTaxFormData {
	country: string;
	id: string;
	address: string;
	name: string;
}

export interface UserTaxDetails {
	country?: string | undefined;
	id?: string | undefined;
	address?: string | undefined;
	name?: string | undefined;
	isForBusiness?: boolean | null;
	can_user_edit?: boolean | false;
}
