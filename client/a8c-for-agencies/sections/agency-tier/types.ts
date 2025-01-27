export type AgencyTier = 'emerging-partner' | 'agency-partner' | 'pro-agency-partner';

export interface AgencyTierCelebrationModal {
	title: string;
	description: string;
	extraDescription?: string;
	benefits?: string[];
	video?: string;
	image: string;
	cta: string;
}
export interface AgencyTierInfo {
	title: string;
	fullTitle: string;
	subtitle: string;
	description: string;
	learnMoreLink: string;
	logo: string;
	includedTiers: string[];
	celebrationModal?: AgencyTierCelebrationModal;
}
