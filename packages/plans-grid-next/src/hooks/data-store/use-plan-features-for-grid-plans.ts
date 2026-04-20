import {
	FEATURE_AI_ASSISTANT,
	FEATURE_AI_WEBSITE_BUILDER,
	FEATURE_AI_WRITER_DESIGNER,
	FEATURE_BUILT_IN_SITE_ASSISTANT,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_EMAIL_MARKETING,
	FEATURE_ENHANCED_AI_ASSISTANT_AND_TOOLS,
	FEATURE_GUIDED_WEBSITE_BUILDER,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR,
	applyTestFiltersToPlansList,
	isBusinessPlan,
	isMonthly,
	isPersonalPlan,
	isPremiumPlan,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import getPlanFeaturesObject from '../../lib/get-plan-features-object';
import useHighlightedFeatures from './use-highlighted-features';
import type {
	TransformedFeatureObject,
	PlanFeaturesForGridPlan,
	PlansIntent,
	GridPlan,
} from '../../types';
import type { FeatureObject, FeatureList } from '@automattic/calypso-products';
import type { TranslateResult } from 'i18n-calypso';

function isPremiumWebsiteBuilderPillFeature( featureSlug: string ): boolean {
	return (
		featureSlug === FEATURE_AI_WEBSITE_BUILDER ||
		featureSlug === FEATURE_GUIDED_WEBSITE_BUILDER ||
		featureSlug === FEATURE_AI_WRITER_DESIGNER
	);
}

function isBusinessAssistantPillFeature( featureSlug: string ): boolean {
	return (
		featureSlug === FEATURE_ENHANCED_AI_ASSISTANT_AND_TOOLS ||
		featureSlug === FEATURE_AI_ASSISTANT ||
		featureSlug === FEATURE_BUILT_IN_SITE_ASSISTANT ||
		featureSlug === FEATURE_AI_WRITER_DESIGNER
	);
}

function getPricingDifferentiationFeatureBadgeText(
	planSlug: string,
	featureSlug: string,
	translate: ( text: string ) => TranslateResult,
	options?: { suppressAiPills?: boolean }
): TranslateResult | undefined {
	const suppressAiPills = options?.suppressAiPills ?? false;

	if ( isPersonalPlan( planSlug ) && featureSlug === FEATURE_CUSTOM_DOMAIN ) {
		return translate( 'Free' );
	}
	if (
		! suppressAiPills &&
		isPremiumPlan( planSlug ) &&
		isPremiumWebsiteBuilderPillFeature( featureSlug )
	) {
		return translate( 'AI' );
	}
	if ( isPremiumPlan( planSlug ) && featureSlug === FEATURE_SIMPLE_PAYMENTS ) {
		return translate( 'New' );
	}
	if (
		! suppressAiPills &&
		isBusinessPlan( planSlug ) &&
		isBusinessAssistantPillFeature( featureSlug )
	) {
		return translate( 'AI' );
	}
	if ( isBusinessPlan( planSlug ) && featureSlug === FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR ) {
		return translate( 'Email' );
	}
	if ( isBusinessPlan( planSlug ) && featureSlug === FEATURE_EMAIL_MARKETING ) {
		return translate( 'New' );
	}
	return undefined;
}

export type UsePlanFeaturesForGridPlans = ( {
	gridPlans,
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList,
	hasRedeemedDomainCredit,
	intent,
	showLegacyStorageFeature,
	selectedFeature,
	isInSignup,
	useFocusedComparisonFeatures,
	useVar41MorePremiumFeatures,
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
	isInSignup?: boolean;
	useFocusedComparisonFeatures?: boolean;
	useVar41MorePremiumFeatures?: boolean;
	useVar42NoAiFeatures?: boolean;
	showPricingDifferentiationFeaturePills?: boolean;
	isExperimentVariant?: boolean;
} ) => { [ planSlug: string ]: PlanFeaturesForGridPlan };

/**
 * usePlanFeaturesForGridPlans:
 * - these plan features are mainly relevant to FeaturesGrid and Spotlight components
 * - this hook can migrate to data store once features definitions migrate to calypso-products
 */
const usePlanFeaturesForGridPlans: UsePlanFeaturesForGridPlans = ( {
	gridPlans,
	allFeaturesList,
	hasRedeemedDomainCredit,
	intent,
	selectedFeature,
	showLegacyStorageFeature,
	isInSignup,
	useFocusedComparisonFeatures,
	useVar41MorePremiumFeatures,
	useVar42NoAiFeatures,
	showPricingDifferentiationFeaturePills,
	isExperimentVariant,
} ) => {
	const translate = useTranslate();
	const highlightedFeatures = useHighlightedFeatures( { intent: intent ?? null, isInSignup } );
	return useMemo( () => {
		return gridPlans.reduce(
			( acc, gridPlan ) => {
				const planSlug = gridPlan.planSlug;
				const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
				const isMonthlyPlan = isMonthly( planSlug );

				let wpcomFeatures: FeatureObject[] = [];
				let jetpackFeatures: FeatureObject[] = [];

				if ( useVar42NoAiFeatures ) {
					// Use the focused_no_ai feature list when available
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getVar42NoAiSignupWpcomFeatures?.() ??
							planConstantObj?.getLongSetSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ??
							[],
						isExperimentVariant ?? true // isExperimentVariant
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true // isExperimentVariant
					);
				} else if ( useVar41MorePremiumFeatures ) {
					// Use the focused_more_premium / focused_new_copy feature list when available
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getVar41MorePremiumSignupWpcomFeatures?.() ??
							planConstantObj?.getLongSetSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ??
							[],
						isExperimentVariant ?? true // isExperimentVariant
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true // isExperimentVariant
					);
				} else if ( useFocusedComparisonFeatures ) {
					// Use getLongSetSignupWpcomFeatures for focused_comparison
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getLongSetSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ??
							[],
						isExperimentVariant ?? true // isExperimentVariant
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true // isExperimentVariant
					);
				} else if ( 'plans-newsletter' === intent ) {
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getNewsletterSignupFeatures?.() ?? []
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
				} else if ( 'plans-wordpress-hosting' === intent ) {
					// Use visual split features for WordPress hosting intent
					if ( planConstantObj?.getVisualSplitBusinessFeatures ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.getVisualSplitBusinessFeatures() ?? []
						);
					} else if ( planConstantObj?.getVisualSplitCommerceFeatures ) {
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj.getVisualSplitCommerceFeatures() ?? []
						);
					} else {
						// Fallback to default features if visual split features aren't available
						wpcomFeatures = getPlanFeaturesObject(
							allFeaturesList,
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ?? []
						);
					}

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? []
					);
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
					const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes( feature.getSlug() );

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
						if ( hasRedeemedDomainCredit && feature.getSlug() === FEATURE_CUSTOM_DOMAIN ) {
							return;
						}

						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);

						const featureSlug = feature.getSlug();

						const badgeText = showPricingDifferentiationFeaturePills
							? getPricingDifferentiationFeatureBadgeText( planSlug, featureSlug, translate, {
									suppressAiPills: useVar42NoAiFeatures,
							  } )
							: undefined;

						wpcomFeaturesTransformed.push( {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
							...( badgeText && { badgeText } ),
						} );
					} );

					if ( wpcomFeaturesTransformed.length > 0 && isExperimentVariant ) {
						const lastIndex = wpcomFeaturesTransformed.length - 1;
						wpcomFeaturesTransformed[ lastIndex ].isExperimentLastFeature = true;
					}
				}

				const storageFeature = planConstantObj.getStorageFeature?.(
					showLegacyStorageFeature,
					gridPlan.current
				);

				return {
					...acc,
					[ planSlug ]: {
						wpcomFeatures: wpcomFeaturesTransformed,
						jetpackFeatures: jetpackFeaturesTransformed,
						...( storageFeature && {
							storageFeature: getPlanFeaturesObject( allFeaturesList, [ storageFeature ] )?.[ 0 ],
						} ),
					},
				};
			},
			{} as { [ planSlug: string ]: PlanFeaturesForGridPlan }
		);
	}, [
		gridPlans,
		intent,
		highlightedFeatures,
		selectedFeature,
		showLegacyStorageFeature,
		allFeaturesList,
		hasRedeemedDomainCredit,
		useFocusedComparisonFeatures,
		useVar41MorePremiumFeatures,
		useVar42NoAiFeatures,
		showPricingDifferentiationFeaturePills,
		isExperimentVariant,
		translate,
	] );
};

export default usePlanFeaturesForGridPlans;
