export type AgencyDirectoryApplicationStatus = 'pending' | 'in-progress' | 'completed';

export type DirectoryApplicationType =
	| 'wordpress'
	| 'jetpack'
	| 'woocommerce'
	| 'pressable'
	| 'vip';

export interface AgencyDirectoryApplication {
	products: string[];
	services: string[];
	directories: DirectoryApplication[];
	feedbackUrl: string;
	status?: AgencyDirectoryApplicationStatus;
	isPublished?: boolean;
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

export interface LeadMatchingDetails {
	// Regions & languages
	regions: string[];
	supportsGlobal: boolean;
	languages: string[];

	// Client types
	businessTypes: string[];
	otherBusinessType: string;
	idealBusinessTypes: string[];
	otherIdealBusinessType: string;
	companySizes: string[];

	// Technical environment
	hostingEnvironments: string[];
	supportsHostingRecommendation: boolean;
	migrationPlatforms: string[];
	storeComplexities: string[];

	// Project types
	projectTypes: string[];
	supportsQuickHelp: boolean;
	serviceLevels: string[];

	// Budget & timeline
	budgetLevels: string[];
	minimumBudget: string;
	timingPreferences: string[];
	supportsHardDeadlines: boolean;

	// Decision making
	decisionProcesses: string[];

	// Ongoing support
	ongoingRelationships: string[];
	requiresMaintenance: boolean;
}
