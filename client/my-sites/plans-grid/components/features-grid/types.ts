import { PlanSlug } from '@automattic/calypso-products';
import { LocalizeProps } from 'i18n-calypso';
import { PlansGridProps } from '../..';

export interface FeaturesGridType extends PlansGridProps {
	isLargeCurrency: boolean;
	translate: LocalizeProps[ 'translate' ];
	canUserManageCurrentPlan?: boolean | null;
	currentPlanManageHref?: string;
	isPlanUpgradeCreditEligible: boolean;
	handleUpgradeClick: ( planSlug: PlanSlug ) => void;
}
