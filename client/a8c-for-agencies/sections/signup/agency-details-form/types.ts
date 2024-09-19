export interface AgencyDetailsPayload {
	firstName: string;
	lastName: string;
	agencyName: string;
	agencyUrl: string;
	managedSites?: string;
	servicesOffered: string[];
	productsOffered: string[];
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	state: string;
	referer?: string | null;
	tos?: 'consented';
}
