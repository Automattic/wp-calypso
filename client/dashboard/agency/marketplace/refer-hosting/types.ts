export type { ReferHostingType } from '../paths';

export interface ReferHostingFormData {
	companyName: string;
	address: string;
	country: string;
	state: string;
	city: string;
	zip: string;
	firstName: string;
	lastName: string;
	title: string;
	phone: string;
	email: string;
	website: string;
	opportunityDescription: string;
	leadType: string;
	isRfp: 'yes' | 'no';
}
