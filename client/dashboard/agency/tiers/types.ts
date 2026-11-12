import type { AgencyTierId, AgencyTierStatus, AmplifyUsage } from '@automattic/api-core';
import type { IconType } from '@wordpress/components';

export type AgencyTierType = AgencyTierId;
export type { AgencyTierStatus };

export type BenefitActionId =
	| 'manage-sites'
	| 'create-client-reports'
	| 'generate-prospect-report'
	| 'view-prospect-reports'
	| 'manage-purchases'
	| 'make-client-referral'
	| 'add-woopayments-to-store'
	| 'contact-support'
	| 'manage-profile'
	| 'download-badge'
	| 'schedule-call';

export type BenefitLinkActionId = Exclude< BenefitActionId, 'download-badge' | 'schedule-call' >;

/**
 * Where each navigating benefit action goes. Each host app passes its own
 * routes; an action with no link is not rendered.
 */
export type TierBenefitLinks = Partial< Record< BenefitLinkActionId, string > >;

export interface BenefitAction {
	id: BenefitActionId;
	label: string;
}

/** Benefits that render live data from the host app. */
export type BenefitId = 'prospect-reports';

export interface Benefit {
	/** Set on benefits that render extra host data, e.g. Prospect reports usage. */
	id?: BenefitId;
	icon: IconType;
	title: string;
	description: string;
	actions?: BenefitAction[];
	status?: string;
	/** Hides the benefit when the host app passes no link for this action. */
	requiresLink?: BenefitLinkActionId;
	/** Only shown on tiers above the agency's own, as an upgrade incentive. */
	isUpgradeOnly?: boolean;
}

/** The agency's Prospect reports usage, shown on the Prospect Reports row. */
export interface ProspectReportsBenefitData {
	usage?: AmplifyUsage;
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
