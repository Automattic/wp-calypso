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
	plansToOfferProducts?: 'Yes' | 'No';
	initialSource?: string;
	bypass_duplicate_check?: boolean;
	skip_hubspot?: boolean;
}

export type PhoneData = {
	phoneNumber?: string;
	countryCode?: string;
};

// The signup form's in-progress data: the submission payload plus UI-only state
// (e.g. the phone input's raw value) that is kept for restoration and stripped
// before submitting.
export type SignupFormData = Partial< AgencyDetailsSignupPayload > & {
	phone?: PhoneData;
};
