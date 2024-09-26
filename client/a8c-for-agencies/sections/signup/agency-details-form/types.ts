export interface AgencyDetailsPayload {
	firstName: string;
	lastName: string;
	agencyName: string;
	agencyUrl: string;
	managedSites?: string;
	userType: string;
	servicesOffered: string[];
	productsOffered: string[];
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	phoneCountryCode?: string;
	phoneCountryNumericCode?: string;
	phoneNumber?: string;
	state: string;
	referer?: string | null;
	tos?: 'consented';
}
