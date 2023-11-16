import {
	applyTestFiltersToPlansList,
	isMonthly,
	isWooExpressPlan,
	type FeatureList,
	FEATURE_CUSTOM_DOMAIN,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import usePlanFeaturesForGridPlans from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-plan-features-for-grid-plans';
import getPlanFeaturesObject from 'calypso/my-sites/plans-grid/lib/get-plan-features-object';
import type {
	TransformedFeatureObject,
	PlanFeaturesForGridPlan,
	PlansIntent,
	GridPlan,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export type UseRestructuredPlanFeaturesForComparisonGrid = ( {
	gridPlans,
	allFeaturesList,
	intent,
	showLegacyStorageFeature,
	selectedFeature,
}: {
	gridPlans: Omit< GridPlan, 'features' >[];
	allFeaturesList: FeatureList;
	intent?: PlansIntent;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
} ) => { [ planSlug: string ]: PlanFeaturesForGridPlan };

const useRestructuredPlanFeaturesForComparisonGrid: UseRestructuredPlanFeaturesForComparisonGrid =
	( { gridPlans, allFeaturesList, intent, selectedFeature, showLegacyStorageFeature } ) => {
		const planFeaturesForGridPlans = usePlanFeaturesForGridPlans( {
			gridPlans,
			allFeaturesList,
			intent,
			selectedFeature,
			showLegacyStorageFeature,
		} );

		return useMemo( () => {
			let previousPlan = null;
			const planFeatureMap: Record< string, PlanFeaturesForGridPlan > = {};

			for ( const gridPlan of gridPlans ) {
				const planSlug = gridPlan.planSlug;
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
							planConstantObj.get2023PricingGridSignupWpcomFeatures?.().slice()
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
					].filter( ( feature ) => {
						// Remove the custom domain feature for Woo Express plans with an introductory offer.
						if (
							'plans-woocommerce' === intent &&
							gridPlan.pricing.introOffer &&
							FEATURE_CUSTOM_DOMAIN === feature.getSlug()
						) {
							return false;
						}
						return true;
					} ),
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
		}, [ gridPlans, allFeaturesList, planFeaturesForGridPlans, intent ] );
	};

export default useRestructuredPlanFeaturesForComparisonGrid;
