export type AgencyDirectoryApplicationStatus = 'pending' | 'in-progress' | 'completed';

export type DirectoryApplicationType = 'wordpress' | 'jetpack' | 'woocommerce' | 'pressable';

export interface AgencyDirectoryApplication {
	products: string[];
	services: string[];
	directories: DirectoryApplication[];
	feedbackUrl: string;
	status?: AgencyDirectoryApplicationStatus;
	isPublished?: boolean;
	editMode?: boolean;
}

export interface DirectoryApplication {
	directory: DirectoryApplicationType;
	urls: string[];
	note?: string;
	isPublished?: boolean;
	status?: 'pending' | 'approved' | 'rejected' | 'closed';
}

export interface AgencyDetails {
	name: string;
	email: string;
	website: string;
	bioDescription: string;
	logoUrl: string;
	landingPageUrl: string;
	country: string;
	isGlobal: boolean;
	isAvailable: boolean;
	industries: string[];
	services: string[];
	products: string[];
	languagesSpoken: string[];
	budgetLowerRange: string;
}
