export type AgencyDirectoryApplicationStatus = 'pending' | 'in-progress' | 'completed';

export type DirectoryApplicationType = 'wordpress' | 'jetpack' | 'woocommerce' | 'pressable';

export interface AgencyDirectoryApplication {
	status: AgencyDirectoryApplicationStatus;
	products: string[];
	services: string[];
	directories: DirectoryApplication[];
	feedbackUrl: string;
}

export interface DirectoryApplication {
	directory: DirectoryApplicationType;
	published: boolean;
	status: 'pending' | 'approved' | 'rejected' | 'closed';
	urls: string[];
	note: string;
}

export interface AgencyDetails {
	name: string;
	email: string;
	website: string;
	bioDescription: string;
	logoUrl: string;
	landingPageUrl: string;
	country: string;
	isAvailable: boolean;
	industry: string;
	services: string[];
	products: string[];
	languagesSpoken: string[];
	budgetLowerRange: string;
}
