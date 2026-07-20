import {
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_ADVANCED_SEO_TOOLS,
	FEATURE_AI_ASSISTANT,
	FEATURE_AI_WEBSITE_BUILDER,
	FEATURE_AI_WRITER_DESIGNER,
	FEATURE_BLAZE_AD_CREDITS,
	FEATURE_BUILT_IN_SITE_ASSISTANT,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_DEV_TOOLS,
	FEATURE_EARLY_ONBOARDING_CALLS,
	FEATURE_EMAIL_MARKETING,
	FEATURE_ENHANCED_AI_ASSISTANT_AND_TOOLS,
	FEATURE_GUIDED_WEBSITE_BUILDER,
	FEATURE_PRIORITY_24_7_SUPPORT,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR,
	FEATURE_REALTIME_BACKUPS_JP,
	FEATURE_STATS_ADVANCED_20250206,
	applyTestFiltersToPlansList,
	isBusinessPlan,
	isEcommercePlan,
	isMonthly,
	isPersonalPlan,
	isPremiumPlan,
	FEATURE_PREMIUM_STORE_THEMES,
	FEATURE_SELL_60_COUNTRIES,
	FEATURE_SUPPORT_FROM_EXPERTS,
	FEATURE_UNLIMITED_ENTITIES,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_UPLOAD_VIDEO,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_WOOCOMMERCE_HOSTING,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
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
import type { Feature, FeatureObject, FeatureList } from '@automattic/calypso-products';
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

function getPlansGridRedesignFeatureSlugsForPlan(
	planSlug: string,
	defaultFeatureSlugs: Feature[]
): Feature[] {
	if ( isPremiumPlan( planSlug ) ) {
		return [
			FEATURE_UNLIMITED_ENTITIES,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_GUIDED_WEBSITE_BUILDER,
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			FEATURE_SUPPORT_FROM_EXPERTS,
			FEATURE_UPLOAD_PLUGINS,
			FEATURE_STATS_ADVANCED_20250206,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_ADVANCED_SEO_TOOLS,
			FEATURE_UPLOAD_VIDEO,
		];
	}

	if ( isBusinessPlan( planSlug ) ) {
		return [
			FEATURE_UNLIMITED_ENTITIES,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_GUIDED_WEBSITE_BUILDER,
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			FEATURE_PRIORITY_24_7_SUPPORT,
			FEATURE_UPLOAD_PLUGINS,
			FEATURE_STATS_ADVANCED_20250206,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_ADVANCED_SEO_TOOLS,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR,
			FEATURE_EMAIL_MARKETING,
			FEATURE_BLAZE_AD_CREDITS,
			FEATURE_REALTIME_BACKUPS_JP,
			FEATURE_DEV_TOOLS,
			FEATURE_EARLY_ONBOARDING_CALLS,
		];
	}

	if ( isEcommercePlan( planSlug ) ) {
		return [
			FEATURE_UNLIMITED_ENTITIES,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_GUIDED_WEBSITE_BUILDER,
			FEATURE_PREMIUM_STORE_THEMES,
			FEATURE_PRIORITY_24_7_SUPPORT,
			FEATURE_UPLOAD_PLUGINS,
			FEATURE_STATS_ADVANCED_20250206,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_ADVANCED_SEO_TOOLS,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR,
			FEATURE_EMAIL_MARKETING,
			FEATURE_BLAZE_AD_CREDITS,
			FEATURE_REALTIME_BACKUPS_JP,
			FEATURE_DEV_TOOLS,
			FEATURE_EARLY_ONBOARDING_CALLS,
			FEATURE_WOOCOMMERCE_HOSTING,
			FEATURE_SELL_60_COUNTRIES,
		];
	}

	return defaultFeatureSlugs;
}

function isBusinessOrEcommercePlan( planSlug: string ): boolean {
	return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
}

function getPlansGridRedesignFeatureTitleOverride(
	planSlug: string,
	featureSlug: string,
	translate: ( text: string ) => TranslateResult
): TranslateResult | undefined {
	if ( isPremiumPlan( planSlug ) && featureSlug === FEATURE_SUPPORT_FROM_EXPERTS ) {
		return translate( 'Free priority support' );
	}
	if ( featureSlug === FEATURE_ADVANCED_SEO_TOOLS ) {
		return translate( 'Advanced SEO tools' );
	}
	if ( isPremiumPlan( planSlug ) && featureSlug === FEATURE_UPLOAD_VIDEO ) {
		return translate( 'Ad-free video hosting' );
	}
	if ( isBusinessOrEcommercePlan( planSlug ) && featureSlug === FEATURE_PRIORITY_24_7_SUPPORT ) {
		return translate( 'Free 24/7 priority support' );
	}
	if ( isBusinessOrEcommercePlan( planSlug ) && featureSlug === FEATURE_VIDEO_UPLOADS ) {
		return translate( 'Ad-free premium video hosting (250GB)' );
	}
	if (
		isBusinessOrEcommercePlan( planSlug ) &&
		featureSlug === FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR
	) {
		return translate( 'Free business email for one year' );
	}
	if ( isBusinessOrEcommercePlan( planSlug ) && featureSlug === FEATURE_EMAIL_MARKETING ) {
		return translate( 'Built-in email marketing' );
	}
	if ( isBusinessOrEcommercePlan( planSlug ) && featureSlug === FEATURE_BLAZE_AD_CREDITS ) {
		return translate( '$200 in ad credits' );
	}
	return undefined;
}

function applyPlansGridRedesignFeatureTitleOverrides(
	features: FeatureObject[],
	planSlug: string,
	translate: ( text: string ) => TranslateResult
): FeatureObject[] {
	if ( ! isPremiumPlan( planSlug ) && ! isBusinessOrEcommercePlan( planSlug ) ) {
		return features;
	}

	return features.map( ( feature ) => {
		const titleOverride = getPlansGridRedesignFeatureTitleOverride(
			planSlug,
			feature.getSlug(),
			translate
		);
		if ( ! titleOverride ) {
			return feature;
		}
		return {
			...feature,
			getTitle: () => titleOverride,
		};
	} );
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
	useVar42NoAiFeatures,
	usePlansGridRedesignFeatures,
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
	useVar42NoAiFeatures?: boolean;
	usePlansGridRedesignFeatures?: boolean;
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
	useVar42NoAiFeatures,
	usePlansGridRedesignFeatures,
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

				if ( usePlansGridRedesignFeatures ) {
					const featureSlugs =
						planConstantObj?.getVar42NoAiSignupWpcomFeatures?.() ??
						planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ??
						[];

					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						getPlansGridRedesignFeatureSlugsForPlan( planSlug, featureSlugs ),
						true
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						true
					);
				} else if ( useVar42NoAiFeatures ) {
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getVar42NoAiSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.() ??
							[],
						isExperimentVariant ?? true
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true
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

				if ( usePlansGridRedesignFeatures ) {
					wpcomFeatures = applyPlansGridRedesignFeatureTitleOverrides(
						wpcomFeatures,
						planSlug,
						translate
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

					if (
						wpcomFeaturesTransformed.length > 0 &&
						( isExperimentVariant || usePlansGridRedesignFeatures )
					) {
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
		useVar42NoAiFeatures,
		usePlansGridRedesignFeatures,
		showPricingDifferentiationFeaturePills,
		isExperimentVariant,
		translate,
	] );
};

export default usePlanFeaturesForGridPlans;
