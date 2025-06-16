export type AgencyProgramFormData = {
	businessEmail: string;
	firstName: string;
	lastName: string;
	jobTitle: string;
	phoneNumber: string;
	country: string;
	servicesProvided: string[];
	agencyWebsite?: string;
	agencySize?: string;
	agencyRevenue?: string;
	clientSites: string;
	subscribeToNewsletter: boolean;
};
