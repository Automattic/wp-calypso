import type { IconType } from '@wordpress/components';

export type AgencyTierType =
	| 'emerging-partner'
	| 'agency-partner'
	| 'pro-agency-partner'
	| 'vip-pro-agency-partner'
	| 'premier-partner';

export type AgencyTierStatus = 'early_access' | 'tier_protected';

export interface BenefitAction {
	id: string;
	label: string;
	href?: string;
}

export interface Benefit {
	icon: IconType;
	title: string;
	description: string;
	actions?: BenefitAction[];
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

/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`). Defaults to a no-op
 * so the shared components work without analytics wired up.
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;
