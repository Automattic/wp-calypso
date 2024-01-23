import { TranslateResult, useTranslate } from 'i18n-calypso';
import type { PlanSlug, StorageOption } from '@automattic/calypso-products';

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

type InnerParams = Omit< UsePlanActionsParams, 'isInSignup' | 'isLaunchPage' >;

type PlanActions = {
	[ planSlug in PlanSlug ]: {
		text: TranslateResult;
		onClick: () => void;
		busy?: boolean;
	};
};

type TranslateFunc = ReturnType< typeof useTranslate >;

function getLaunchPagePlanActions(
	{
		availableForPurchase,
		currentSitePlanSlug,
		isPopular,
		isMonthlyPlan,
		onUpgradeClick,
		planSlug,
		buttonText,
		showMonthlyPrice,
		isStuck,
		isLargeCurrency,
		storageOptions,
	}: InnerParams,
	translate: TranslateFunc
): PlanActions {}

function getSignupPlanActions(
	{
		availableForPurchase,
		currentSitePlanSlug,
		isPopular,
		isMonthlyPlan,
		onUpgradeClick,
		planSlug,
		buttonText,
		showMonthlyPrice,
		isStuck,
		isLargeCurrency,
		storageOptions,
	}: InnerParams,
	translate: TranslateFunc
): PlanActions {}

function getLoggedInPlanActions(
	{
		availableForPurchase,
		currentSitePlanSlug,
		isPopular,
		isMonthlyPlan,
		onUpgradeClick,
		planSlug,
		buttonText,
		showMonthlyPrice,
		isStuck,
		isLargeCurrency,
		storageOptions,
	}: InnerParams,
	translate: TranslateFunc
): PlanActions {}

function usePlanActions( params: UsePlanActionsParams ): PlanActions {
	const translate = useTranslate();
	const { isLaunchPage, isInSignup } = params;

	if ( isLaunchPage ) {
		return getLaunchPagePlanActions( params, translate );
	}

	if ( isInSignup ) {
		return getSignupPlanActions( params, translate );
	}

	return getLoggedInPlanActions( params, translate );
}

export default usePlanActions;
