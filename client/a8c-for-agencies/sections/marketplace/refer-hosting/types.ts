export type ReferHostingFormData = {
	companyName: string;
	address: string;
	country: string;
	state?: string;
	city: string;
	zip: string;

	firstName: string;
	lastName: string;
	title: string;
	phone?: string;
	email: string;
	website: string;

	opportunityDescription: string;
	leadType: string;
	isRfp: boolean;
};

export type ReferHostingFormDataPayload = {
	company_name: string;
	address: string;
	country_code: string;
	state: string;
	city: string;
	zip: string;

	first_name: string;
	last_name: string;
	title: string;
	phone: string;
	email: string;
	website: string;

	opportunity_description: string;
	lead_type?: string;
	is_rfp?: boolean;
};

export type FormFieldsConfig = {
	[ key: string ]: {
		enabled?: boolean;
	};
};

export type ReferHostingType = 'enterprise' | 'premium';
