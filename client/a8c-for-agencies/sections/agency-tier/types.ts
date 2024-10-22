export interface AgencyTierInfo {
	title: string;
	fullTitle: string;
	subtitle: string;
	description: string;
	logo: string;
	includedTiers: string[];
	emptyStateMessage?: string;
	celebrationModal: {
		title: string;
		description: string;
		extraDescription?: string;
		benefits: string[];
		video: string;
	};
}
