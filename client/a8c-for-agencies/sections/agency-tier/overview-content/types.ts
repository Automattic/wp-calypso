import type { IconType } from '@wordpress/components';

export type AgencyTierType =
	| 'emerging-partner'
	| 'agency-partner'
	| 'pro-agency-partner'
	| 'vip-pro-agency-partner'
	| 'premier-partner';

export interface Benefit {
	icon: IconType;
	title: string;
	description: string;
	actions?: {
		id: string;
		label: string;
		href?: string;
	}[];
	status?: string;
}
export interface TierItem {
	id: AgencyTierType;
	level: number;
	name: string;
	description: string;
	heading: string;
	subheading: string;
	progressCardDescription: string;
	influencedRevenue: number;
	benefits: Benefit[];
}
