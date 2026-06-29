import type { AgencyTierId, AgencyTierStatus } from '@automattic/api-core';
import type { IconType } from '@wordpress/components';

export type AgencyTierType = AgencyTierId;
export type { AgencyTierStatus };

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
