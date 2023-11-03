import type { PlanActionOverrides } from '../../types';
import type { PlanSlug, WPComStorageAddOnSlug } from '@automattic/calypso-products';

export type ComparisonGridProps = {
	intervalType: string;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	flowName?: string | null;
	currentSitePlanSlug?: string | null;
	currentPlanManageHref?: string;
	canUserManageCurrentPlan?: boolean | null;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	siteId?: number | null;
	planActionOverrides?: PlanActionOverrides;
	selectedPlan?: string;
	selectedFeature?: string;
	showLegacyStorageFeature?: boolean;
	showUpgradeableStorage: boolean;
	stickyRowOffset: number;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	showRefundPeriod?: boolean;
};
