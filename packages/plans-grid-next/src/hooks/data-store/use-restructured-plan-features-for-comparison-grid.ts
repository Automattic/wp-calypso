import {
	applyTestFiltersToPlansList,
	isMonthly,
	isWooExpressPlan,
	type FeatureList,
	FEATURE_CUSTOM_DOMAIN,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { hasTailoredFeatureList } from '../../constants';
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
	useVar42NoAiFeatures,
	showPricingDifferentiationFeaturePills,
	isExperimentVariant,
}: {
	gridPlans: Omit< GridPlan, 'features' >[];
	allFeaturesList: FeatureList;
	hasRedeemedDomainCredit?: boolean;
	intent?: PlansIntent;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
	useVar42NoAiFeatures?: boolean;
	showPricingDifferentiationFeaturePills?: boolean;
	isExperimentVariant?: boolean;
} ) => { [ planSlug: string ]: PlanFeaturesForGridPlan };

const useRestructuredPlanFeaturesForComparisonGrid: UseRestructuredPlanFeaturesForComparisonGrid =
	( {
		gridPlans,
		allFeaturesList,
		hasRedeemedDomainCredit,
		intent,
		selectedFeature,
		showLegacyStorageFeature,
		useVar42NoAiFeatures,
		showPricingDifferentiationFeaturePills,
		isExperimentVariant,
	} ) => {
		const planFeaturesForGridPlans = usePlanFeaturesForGridPlans( {
			gridPlans,
			allFeaturesList,
			intent,
			selectedFeature,
			showLegacyStorageFeature,
			useVar42NoAiFeatures,
			showPricingDifferentiationFeaturePills,
			isExperimentVariant,
		} );

		return useMemo( () => {
			// An intent that curates its own comparison list keeps it; see TAILORED_FEATURE_LIST_INTENTS.
			const useDifferentiationFeatures = ! hasTailoredFeatureList( intent );
			let previousPlan = null;
			const planFeatureMap: Record< string, PlanFeaturesForGridPlan > = {};

			for ( const gridPlan of gridPlans ) {
				const planSlug = gridPlan.planSlug;
				const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
				const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.();
				const isMonthlyPlan = isMonthly( planSlug );

				let wpcomFeatures;

				// Plans differentiators (non-control): use experiment comparison override when present.
				if (
					isExperimentVariant &&
					useDifferentiationFeatures &&
					planConstantObj.get2023PlanComparisonFeatureOverrideForExperiment?.()?.length
				) {
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PlanComparisonFeatureOverrideForExperiment().slice(),
						isExperimentVariant
					);
				} else if (
					// Check if there's a specific override for comparison
					planConstantObj.get2023PlanComparisonFeatureOverride?.().length
				) {
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PlanComparisonFeatureOverride().slice()
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
							planConstantObj.get2023PricingGridSignupWpcomFeatures?.().slice()
						);
					}
				} else {
					// Default case
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupWpcomFeatures?.().slice()
					);
				}

				// Plans Differentiators Experiment: For comparison grid, use dedicated experiment override function
				// when in an experiment variant for Jetpack features.
				// Note: We check if the function exists, not if it returns a non-empty array, because an empty array
				// is a valid return value (meaning "show no Jetpack features").
				let jetpackFeatures;
				if (
					isExperimentVariant &&
					useDifferentiationFeatures &&
					planConstantObj.get2023PlanComparisonJetpackFeatureOverrideForExperiment
				) {
					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PlanComparisonJetpackFeatureOverrideForExperiment().slice(),
						isExperimentVariant
					);
				} else if ( planConstantObj.get2023PlanComparisonJetpackFeatureOverride?.().length ) {
					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PlanComparisonJetpackFeatureOverride().slice()
					);
				} else {
					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.().slice()
					);
				}

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
					// Labels follow the list: the experiment copy describes features the experiment
					// override lists, so pairing it with a curated list mislabels the rows.
					comparisonGridFeatureLabels: planConstantObj.getPlanComparisonFeatureLabels?.( {
						isExperimentVariant: isExperimentVariant && useDifferentiationFeatures,
					} ),
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
			isExperimentVariant,
		] );
	};

export default useRestructuredPlanFeaturesForComparisonGrid;
