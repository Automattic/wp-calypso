export type ReferEnterpriseHostingFormData = {
	companyName: string;
	address: string;
	countryCode: string;
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
	leadType?: 'media' | 'public' | 'other';
	includeRfp?: 'yes' | 'no';
	rfpFile?: File;
};
