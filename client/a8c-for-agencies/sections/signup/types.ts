export interface AgencyDetailsSignupPayload {
	firstName: string;
	lastName: string;
	agencyName: string;
	agencyUrl: string;
	managedSites?: string;
	userType: string;
	servicesOffered: string[];
	productsOffered: string[];
	productsToOffer: string[];
	email: string;
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	phoneNumber?: string;
	state: string;
	referer?: string | null;
	tos?: 'consented';
	topPartneringGoal?: string;
	topYearlyGoal?: string;
	workWithClients?: string;
	workWithClientsOther?: string;
	approachAndChallenges?: string;
	agencySize?: string;
	plansToOfferProducts?: boolean;
}
