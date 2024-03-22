export interface AgencyDetailsPayload {
	agencyName: string;
	agencyUrl: string;
	managedSites?: string;
	servicesOffered: string[];
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	state: string;
	tos?: 'consented';
}
