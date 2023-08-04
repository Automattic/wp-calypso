import {
	applyTestFiltersToPlansList,
	isMonthly,
	isWooExpressPlan,
	type PlanSlug,
	type FeatureList,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import usePlanFeaturesForGridPlans from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-plan-features-for-grid-plans';
import getPlanFeaturesObject from 'calypso/my-sites/plan-features-2023-grid/lib/get-plan-features-object';
import type {
	TransformedFeatureObject,
	PlanFeaturesForGridPlan,
	PlansIntent,
} from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';

export type UseRestructuredPlanFeaturesForComparisonGrid = ( {
	planSlugs,
	allFeaturesList,
	intent,
	isGlobalStylesOnPersonal,
	showLegacyStorageFeature,
	selectedFeature,
}: {
	planSlugs: PlanSlug[];
	allFeaturesList: FeatureList;
	intent?: PlansIntent;
	isGlobalStylesOnPersonal?: boolean;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
} ) => { [ planSlug: string ]: PlanFeaturesForGridPlan };

const useRestructuredPlanFeaturesForComparisonGrid: UseRestructuredPlanFeaturesForComparisonGrid =
	( {
		planSlugs,
		allFeaturesList,
		intent,
		isGlobalStylesOnPersonal,
		selectedFeature,
		showLegacyStorageFeature,
	}: {
		planSlugs: PlanSlug[];
		allFeaturesList: FeatureList;
		intent?: PlansIntent;
		isGlobalStylesOnPersonal?: boolean;
		selectedFeature?: string | null;
		showLegacyStorageFeature?: boolean;
	} ) => {
		const planFeaturesForGridPlans = usePlanFeaturesForGridPlans( {
			planSlugs,
			allFeaturesList,
			intent,
			isGlobalStylesOnPersonal,
			selectedFeature,
			showLegacyStorageFeature,
		} );

		const restructuredFeatures = useMemo( () => {
			let previousPlan = null;
			const planFeatureMap: Record< string, PlanFeaturesForGridPlan > = {};

			for ( const planSlug of planSlugs ) {
				const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
				const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.();
				const isMonthlyPlan = isMonthly( planSlug );

				const wpcomFeatures = planConstantObj.get2023PlanComparisonFeatureOverride
					? getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.get2023PlanComparisonFeatureOverride().slice()
					  )
					: getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj
								.get2023PricingGridSignupWpcomFeatures?.( isGlobalStylesOnPersonal )
								.slice()
					  );

				const jetpackFeatures = planConstantObj.get2023PlanComparisonJetpackFeatureOverride
					? getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.get2023PlanComparisonJetpackFeatureOverride().slice()
					  )
					: getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.get2023PricingGridSignupJetpackFeatures?.().slice()
					  );

				const wpcomFeaturesTransformed: TransformedFeatureObject[] | null | undefined =
					annualPlansOnlyFeatures
						? wpcomFeatures?.map( ( feature ) => {
								const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
									feature.getSlug()
								);

								return {
									...feature,
									availableOnlyForAnnualPlans,
									availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
								};
						  } )
						: null;

				const jetpackFeaturesTransformed: TransformedFeatureObject[] | null | undefined =
					annualPlansOnlyFeatures
						? jetpackFeatures?.map( ( feature ) => {
								const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
									feature.getSlug()
								);

								return {
									...feature,
									availableOnlyForAnnualPlans,
									availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
								};
						  } )
						: null;

				const featuresAvailable = isWooExpressPlan( planSlug )
					? {
							wpcomFeatures: wpcomFeaturesTransformed ?? [],
							jetpackFeatures: [],
					  }
					: {
							wpcomFeatures: wpcomFeaturesTransformed ?? [],
							jetpackFeatures: jetpackFeaturesTransformed ?? [],
					  };

				const previousPlanFeatures = {
					wpcomFeatures: previousPlan !== null ? planFeatureMap[ previousPlan ].wpcomFeatures : [],
					jetpackFeatures:
						previousPlan !== null ? planFeatureMap[ previousPlan ].jetpackFeatures : [],
				};

				planFeatureMap[ planSlug ] = {
					wpcomFeatures: [
						...featuresAvailable.wpcomFeatures,
						...previousPlanFeatures.wpcomFeatures,
					],
					jetpackFeatures: [
						...featuresAvailable.jetpackFeatures,
						...previousPlanFeatures.jetpackFeatures,
					],
					storageOptions: planFeaturesForGridPlans[ planSlug ].storageOptions,
					conditionalFeatures: getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PlanComparisonConditionalFeatures?.()
					),
				};

				previousPlan = planSlug;
			}
			return planFeatureMap;
		}, [ allFeaturesList, planFeaturesForGridPlans, planSlugs ] );

		return restructuredFeatures;
	};

export default useRestructuredPlanFeaturesForComparisonGrid;
