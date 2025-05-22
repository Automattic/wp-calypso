export interface AgencyDetailsPayload {
	firstName: string;
	lastName: string;
	agencyName: string;
	agencyUrl: string;
	agencySize?: string;
	managedSites?: string;
	userType: string;
	servicesOffered: string[];
	productsOffered: string[];
	productsToOffer: string[];
	plansToOfferProducts?: 'Yes' | 'No';
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	phone?: {
		phoneNumberFull?: string;
		phoneNumber?: string;
		countryCode?: string;
	};
	state: string;
	referer?: string | null;
	tos?: 'consented';
}
