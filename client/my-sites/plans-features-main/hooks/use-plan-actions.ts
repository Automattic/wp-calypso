import { TranslateResult, useTranslate } from 'i18n-calypso';
import type { PlanSlug, StorageOption } from '@automattic/calypso-products';
import type { PlanActionGetter, GridPlan } from '@automattic/plans-grid-next';

type UsePlanActionsParams = {
	availableForPurchase: boolean;
	currentSitePlanSlug?: string | null;
	isPopular?: boolean;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	isMonthlyPlan?: boolean;
	onUpgradeClick: ( overridePlanSlug?: PlanSlug ) => void;
	planSlug: PlanSlug;
	buttonText?: string;
	showMonthlyPrice: boolean;
	isStuck: boolean;
	isLargeCurrency?: boolean;
	storageOptions?: StorageOption[];
};

type TranslateFunc = ReturnType< typeof useTranslate >;

function getLaunchPagePlanActions(
	translate: TranslateFunc
): PlanActionGetter {}

function getSignupPlanActions(
	translate: TranslateFunc
): PlanActionGetter {

}

function getLoggedInPlanActions(
	translate: TranslateFunc,
): PlanActionGetter {}

function usePlanActions( isLaunchPage: boolean, isInSignup: boolean ): GetPlanActionFunc {
	const translate = useTranslate();

	if ( isLaunchPage ) {
		return getLaunchPagePlanActions( translate );
	}

	if ( isInSignup ) {
		return getSignupPlanActions( translate );
	}

	return getLoggedInPlanActions( translate );
}

export default usePlanActions;
