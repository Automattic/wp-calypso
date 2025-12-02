import {
	applyTestFiltersToPlansList,
	isMonthly,
	isWooExpressPlan,
	type FeatureList,
	FEATURE_CUSTOM_DOMAIN,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import getPlanFeaturesObject from '../../lib/get-plan-features-object';
import usePlanFeaturesForGridPlans from './use-plan-features-for-grid-plans';
import type {
	TransformedFeatureObject,
	PlanFeaturesForGridPlan,
	PlansIntent,
	GridPlan,
} from '../../types';

export type UseRestructuredPlanFeaturesForComparisonGrid = ( {
	gridPlans,
	allFeaturesList,
	hasRedeemedDomainCredit,
	intent,
	showLegacyStorageFeature,
	selectedFeature,
	isSummerSpecial,
}: {
	gridPlans: Omit< GridPlan, 'features' >[];
	allFeaturesList: FeatureList;
	hasRedeemedDomainCredit?: boolean;
	intent?: PlansIntent;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
	isSummerSpecial?: boolean;
} ) => { [ planSlug: string ]: PlanFeaturesForGridPlan };

const useRestructuredPlanFeaturesForComparisonGrid: UseRestructuredPlanFeaturesForComparisonGrid =
	( {
		gridPlans,
		allFeaturesList,
		hasRedeemedDomainCredit,
		intent,
		selectedFeature,
		showLegacyStorageFeature,
		isSummerSpecial,
	} ) => {
		const planFeaturesForGridPlans = usePlanFeaturesForGridPlans( {
			gridPlans,
			allFeaturesList,
			intent,
			selectedFeature,
			showLegacyStorageFeature,
			isSummerSpecial,
		} );

		return useMemo( () => {
			let previousPlan = null;
			const planFeatureMap: Record< string, PlanFeaturesForGridPlan > = {};

			for ( const gridPlan of gridPlans ) {
				const planSlug = gridPlan.planSlug;
				const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
				const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.();
				const isMonthlyPlan = isMonthly( planSlug );

				let wpcomFeatures;

				// Check if there's a specific override for comparison
				if (
					planConstantObj.get2023PlanComparisonFeatureOverride?.( {
						isSummerSpecial,
					} ).length
				) {
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PlanComparisonFeatureOverride( { isSummerSpecial } ).slice()
					);
				} else if ( 'plans-wordpress-hosting' === intent ) {
					// Use visual split features for WordPress hosting intent
					if ( planConstantObj?.getVisualSplitBusinessFeatures ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.getVisualSplitBusinessFeatures().slice()
						);
					} else if ( planConstantObj?.getVisualSplitCommerceFeatures ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.getVisualSplitCommerceFeatures().slice()
						);
					} else {
						// Fallback to default features
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.get2023PricingGridSignupWpcomFeatures?.( { isSummerSpecial } ).slice()
						);
					}
				} else {
					// Default case
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupWpcomFeatures?.( { isSummerSpecial } ).slice()
					);
				}

				const jetpackFeatures = planConstantObj.get2023PlanComparisonJetpackFeatureOverride?.()
					.length
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
						// Remove the custom domain feature if custom domain has been redeemed or for Woo Express plans with an introductory offer.
						if (
							( ( 'plans-woocommerce' === intent && gridPlan.pricing.introOffer ) ||
								hasRedeemedDomainCredit ) &&
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
					storageFeature: planFeaturesForGridPlans[ planSlug ].storageFeature,
					comparisonGridFeatureLabels: planConstantObj.getPlanComparisonFeatureLabels?.(),
				};

				previousPlan = planSlug;
			}

			return planFeatureMap;
		}, [
			gridPlans,
			allFeaturesList,
			planFeaturesForGridPlans,
			intent,
			hasRedeemedDomainCredit,
			isSummerSpecial,
		] );
	};

export default useRestructuredPlanFeaturesForComparisonGrid;
