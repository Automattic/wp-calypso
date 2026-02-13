import config from '@automattic/calypso-config';
import {
	getFeaturesList,
	getPlanFeaturesGroupedForFeaturesGrid,
	type PlanSlug,
	type UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import {
	FeaturesGrid,
	PlanTypeSelector,
	useGridPlansForFeaturesGrid,
	usePlanBillingPeriod,
} from '@automattic/plans-grid-next';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs';
import useGenerateActionHook from 'calypso/my-sites/plans-features-main/hooks/use-generate-action-hook';
import type { DataResponse, SupportedUrlFriendlyTermType } from '@automattic/plans-grid-next';

interface MigrationPlansGridProps {
	siteId: number;
	onUpgradeClick: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	coupon?: string;
}

const DISPLAYED_INTERVALS: UrlFriendlyTermType[] = [ 'monthly', 'yearly', '2yearly' ];

export default function MigrationPlansGrid( {
	siteId,
	onUpgradeClick,
	coupon,
}: MigrationPlansGridProps ) {
	const [ intervalType, setIntervalType ] = useState< 'monthly' | 'yearly' | '2yearly' >(
		'yearly'
	);

	const handlePlanIntervalUpdate = useCallback( ( interval: SupportedUrlFriendlyTermType ) => {
		setIntervalType( interval as 'monthly' | 'yearly' | '2yearly' );
	}, [] );

	const term = usePlanBillingPeriod( { intervalType } );
	const currentPlan = Plans.useCurrentPlan( { siteId } );

	const useAction = useGenerateActionHook( {
		siteId,
		cartHandler: onUpgradeClick,
		flowName: 'site-migration',
		plansIntent: 'plans-migration',
		isInSignup: true,
		isLaunchPage: false,
		coupon,
		useCheckPlanAvailabilityForPurchase,
		showBillingDescriptionForIncreasedRenewalPrice: null,
		enableCategorisedFeatures: true,
		reflectStorageSelectionInPlanPrices: true,
	} );

	// Subdomain is not needed for migration - use empty response
	const generatedWPComSubdomain: DataResponse< { domain_name: string } > = useMemo(
		() => ( {
			isLoading: false,
			result: { domain_name: '' },
		} ),
		[]
	);

	const gridPlans = useGridPlansForFeaturesGrid( {
		allFeaturesList: getFeaturesList(),
		coupon,
		eligibleForFreeHostingTrial: false,
		hasRedeemedDomainCredit: currentPlan?.hasRedeemedDomainCredit,
		hiddenPlans: {
			hideFreePlan: true,
			hidePersonalPlan: false,
			hidePremiumPlan: false,
			hideBusinessPlan: false,
			hideEcommercePlan: false,
			hideEnterprisePlan: true,
		},
		intent: 'plans-migration',
		isDisplayingPlansNeededForFeature: false,
		isInSignup: true,
		isSubdomainNotGenerated: false,
		selectedFeature: undefined,
		selectedPlan: undefined,
		showLegacyStorageFeature: false,
		siteId,
		useCheckPlanAvailabilityForPurchase,
		useFreeTrialPlanSlugs,
		isDomainOnlySite: false,
		term,
		reflectStorageSelectionInPlanPrices: true,
	} );

	const gridPlansForPlanTypeSelector = useMemo(
		() => gridPlans?.map( ( { planSlug } ) => planSlug ) ?? [],
		[ gridPlans ]
	);

	const featureGroupMap = useMemo( () => getPlanFeaturesGroupedForFeaturesGrid(), [] );

	// Key behavior: Show term savings for yearly and 2-yearly plans (monthly is the base term)
	const enableTermSavingsPriceDisplay = intervalType !== 'monthly';

	const planTypeSelectorProps = useMemo(
		() => ( {
			kind: 'interval' as const,
			siteId,
			basePlansPath: null,
			intervalType,
			customerType: 'personal',
			onPlanIntervalUpdate: handlePlanIntervalUpdate,
			selectedPlan: undefined,
			selectedFeature: undefined,
			showPlanTypeSelectorDropdown: config.isEnabled( 'onboarding/interval-dropdown' ),
			isInSignup: true,
			isStepperUpgradeFlow: false,
			plans: gridPlansForPlanTypeSelector as PlanSlug[],
			eligibleForWpcomMonthlyPlans: true,
			displayedIntervals: DISPLAYED_INTERVALS,
			useCheckPlanAvailabilityForPurchase,
			coupon,
			layoutClassName: 'migration-plans-grid__plan-type-selector-layout',
		} ),
		[ siteId, intervalType, handlePlanIntervalUpdate, gridPlansForPlanTypeSelector, coupon ]
	);

	if ( ! gridPlans ) {
		return null;
	}

	return (
		<div className="migration-plans-grid">
			{ config.isEnabled( 'onboarding/interval-dropdown' ) && (
				<PlanTypeSelector { ...planTypeSelectorProps } />
			) }
			<FeaturesGrid
				allFeaturesList={ getFeaturesList() }
				className="migration-plans-grid__features-grid"
				coupon={ coupon }
				currentSitePlanSlug={ currentPlan?.productSlug }
				generatedWPComSubdomain={ generatedWPComSubdomain }
				gridPlans={ gridPlans }
				hideUnavailableFeatures={ false }
				intent="plans-migration"
				isCustomDomainAllowedOnFreePlan={ false }
				isInAdmin={ false }
				isInSiteDashboard={ false }
				isInSignup
				onStorageAddOnClick={ () => {} }
				recordTracksEvent={ recordTracksEvent }
				reflectStorageSelectionInPlanPrices
				showLegacyStorageFeature={ false }
				showRefundPeriod={ false }
				showUpgradeableStorage={ false }
				siteId={ siteId }
				stickyRowOffset={ 0 }
				useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
				useAction={ useAction }
				enableFeatureTooltips
				featureGroupMap={ featureGroupMap }
				enableCategorisedFeatures
				enableStorageAsBadge={ false }
				enableReducedFeatureGroupSpacing
				enableTermSavingsPriceDisplay={ enableTermSavingsPriceDisplay }
				showSimplifiedBillingDescription
			/>
		</div>
	);
}
