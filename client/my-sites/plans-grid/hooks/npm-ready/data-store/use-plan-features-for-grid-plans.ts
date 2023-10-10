import {
	FEATURE_CUSTOM_DOMAIN,
	applyTestFiltersToPlansList,
	isMonthly,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import getPlanFeaturesObject from '../../../lib/get-plan-features-object';
import useHighlightedFeatures from './use-highlighted-features';
import type { FeatureObject, FeatureList } from '@automattic/calypso-products';
import type {
	TransformedFeatureObject,
	PlanFeaturesForGridPlan,
	PlansIntent,
	GridPlan,
} from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export type UsePlanFeaturesForGridPlans = ( {
	gridPlans,
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList,
	intent,
	showLegacyStorageFeature,
	selectedFeature,
	isInSignup,
}: {
	gridPlans: Omit< GridPlan, 'features' >[];
	allFeaturesList: FeatureList;
	intent?: PlansIntent;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
	isInSignup?: boolean;
} ) => { [ planSlug: string ]: PlanFeaturesForGridPlan };

/**
 * usePlanFeaturesForGridPlans:
 * - these plan features are mainly relevannt to FeaturesGrid and Spotlight components
 * - this hook can migrate to data store once features definitions migrate to calypso-products
 */
const usePlanFeaturesForGridPlans: UsePlanFeaturesForGridPlans = ( {
	gridPlans,
	allFeaturesList,
	intent,
	selectedFeature,
	showLegacyStorageFeature,
	isInSignup,
} ) => {
	const highlightedFeatures = useHighlightedFeatures( { intent: intent ?? null, isInSignup } );

	return useMemo(
		() =>
			gridPlans.reduce(
				( acc, gridPlan ) => {
					const planSlug = gridPlan.planSlug;
					const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
					const isMonthlyPlan = isMonthly( planSlug );

					let wpcomFeatures: FeatureObject[] = [];
					let jetpackFeatures: FeatureObject[] = [];

					if ( 'plans-newsletter' === intent ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.getNewsletterSignupFeatures?.() ?? []
						);
					} else if ( 'plans-link-in-bio' === intent ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.getLinkInBioSignupFeatures?.() ?? []
						);
					} else if ( 'plans-p2' === intent ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ?? []
						);
					} else if ( 'plans-blog-onboarding' === intent ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.getBlogOnboardingSignupFeatures?.() ?? []
						);

						jetpackFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.getBlogOnboardingSignupJetpackFeatures?.() ?? []
						);
					} else if ( 'plans-woocommerce' === intent ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ?? []
						);

						jetpackFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? []
						);

						/*
						 * Woo Express plans with an introductory offer need some features removed:
						 * - custom domain feature removed for all Woo Express plans
						 */
						if ( gridPlan.pricing.introOffer ) {
							wpcomFeatures = wpcomFeatures.filter( ( feature ) => {
								// Remove the custom domain feature for Woo Express plans with an introductory offer.
								if ( FEATURE_CUSTOM_DOMAIN === feature.getSlug() ) {
									return false;
								}

								return true;
							} );
						}
					} else {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ?? []
						);

						jetpackFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? []
						);
					}

					const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.() || [];
					const wpcomFeaturesTransformed: TransformedFeatureObject[] = [];
					const jetpackFeaturesTransformed = jetpackFeatures.map( ( feature ) => {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);

						return {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
						};
					} );

					if ( highlightedFeatures ) {
						// slice() and reverse() are needed to the preserve order of features
						highlightedFeatures
							.slice()
							.reverse()
							.forEach( ( slug ) => {
								const feature = wpcomFeatures.find( ( feature ) => feature.getSlug() === slug );
								if ( feature ) {
									const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
										feature.getSlug()
									);
									wpcomFeaturesTransformed.unshift( {
										...feature,
										availableOnlyForAnnualPlans,
										availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
										isHighlighted: true,
									} );
								}
							} );
					}

					const topFeature = selectedFeature
						? wpcomFeatures.find( ( feature ) => feature.getSlug() === selectedFeature )
						: undefined;

					if ( topFeature ) {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							topFeature.getSlug()
						);
						wpcomFeaturesTransformed.unshift( {
							...topFeature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
						} );
					}

					if ( annualPlansOnlyFeatures.length > 0 ) {
						wpcomFeatures.forEach( ( feature ) => {
							// topFeature and highlightedFeatures are already added to the list above
							const isHighlightedFeature =
								highlightedFeatures && highlightedFeatures.includes( feature.getSlug() );
							if ( feature === topFeature || isHighlightedFeature ) {
								return;
							}

							const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
								feature.getSlug()
							);

							wpcomFeaturesTransformed.push( {
								...feature,
								availableOnlyForAnnualPlans,
								availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
							} );
						} );
					}

					return {
						...acc,
						[ planSlug ]: {
							wpcomFeatures: wpcomFeaturesTransformed,
							jetpackFeatures: jetpackFeaturesTransformed,
							storageOptions:
								planConstantObj.get2023PricingGridSignupStorageOptions?.(
									showLegacyStorageFeature
								) ?? [],
						},
					};
				},
				{} as { [ planSlug: string ]: PlanFeaturesForGridPlan }
			),
		[
			gridPlans,
			intent,
			highlightedFeatures,
			selectedFeature,
			showLegacyStorageFeature,
			allFeaturesList,
		]
	);
};

export default usePlanFeaturesForGridPlans;
