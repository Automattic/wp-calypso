import {
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_WORDADS,
	FEATURE_AI_WRITER_DESIGNER,
	FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR,
	FEATURE_EARLY_ONBOARDING_CALLS,
	applyTestFiltersToPlansList,
	isMonthly,
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

export type UsePlanFeaturesForGridPlans = ( {
	gridPlans,
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList,
	hasRedeemedDomainCredit,
	intent,
	showLegacyStorageFeature,
	selectedFeature,
	isInSignup,
	isSummerSpecial,
	useLongSetFeatures,
	useLongSetStackedFeatures,
	useShortSetStackedFeatures,
	useVar5Features,
	isExperimentVariant,
	isVar1dVariant,
}: {
	gridPlans: Omit< GridPlan, 'features' >[];
	allFeaturesList: FeatureList;
	hasRedeemedDomainCredit?: boolean;
	intent?: PlansIntent;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
	isInSignup?: boolean;
	isSummerSpecial?: boolean;
	useLongSetFeatures?: boolean;
	useLongSetStackedFeatures?: boolean;
	useShortSetStackedFeatures?: boolean;
	useVar5Features?: boolean;
	isExperimentVariant?: boolean;
	/**
	 * When true, mark features after "Everything in X, plus:" header as differentiator features.
	 * Used for var1d experiment variant styling.
	 */
	isVar1dVariant?: boolean;
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
	isSummerSpecial,
	useLongSetFeatures,
	useLongSetStackedFeatures,
	useShortSetStackedFeatures,
	useVar5Features,
	isExperimentVariant,
	isVar1dVariant,
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

				if ( useVar5Features ) {
					// Use var5 features (getVar5StackedSignupWpcomFeatures) for var5 variant
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getVar5StackedSignupWpcomFeatures?.() ??
							planConstantObj?.getShortSetStackedSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
								isSummerSpecial,
							} ) ??
							[],
						isExperimentVariant ?? true // isExperimentVariant
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true // isExperimentVariant
					);
				} else if ( useShortSetStackedFeatures ) {
					// Use the stacked features (incremental) for var1/var1d variant
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getShortSetStackedSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
								isSummerSpecial,
							} ) ??
							[],
						isExperimentVariant ?? true // isExperimentVariant
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true // isExperimentVariant
					);
				} else if ( useLongSetStackedFeatures ) {
					// Use the stacked features (incremental) for var3 variant
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getLongSetStackedSignupWpcomFeatures?.() ??
							planConstantObj?.getLongSetSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
								isSummerSpecial,
							} ) ??
							[],
						isExperimentVariant ?? true // isExperimentVariant
					);

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? [],
						isExperimentVariant ?? true // isExperimentVariant
					);
				} else if ( useLongSetFeatures ) {
					// Use the long set features for var4 variant
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.getLongSetSignupWpcomFeatures?.() ??
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
								isSummerSpecial,
							} ) ??
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
						planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
							isSummerSpecial,
						} ) ?? []
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
						planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
							isSummerSpecial,
						} ) ?? []
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
							planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
								isSummerSpecial,
							} ) ?? []
						);
					}

					jetpackFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj.get2023PricingGridSignupJetpackFeatures?.() ?? []
					);
				} else {
					wpcomFeatures = getPlanFeaturesObject(
						allFeaturesList,
						planConstantObj?.get2023PricingGridSignupWpcomFeatures?.( {
							isSummerSpecial,
						} ) ?? []
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
					// Track whether we've passed a header feature for var1d styling
					let passedHeaderFeature = false;

					// var1d badge mapping for specific features
					const var1dBadgeMap: Record< string, TranslateResult > = {
						[ FEATURE_CUSTOM_DOMAIN ]: translate( 'Free' ),
						[ FEATURE_UPLOAD_PLUGINS ]: translate( 'New' ),
						[ FEATURE_SIMPLE_PAYMENTS ]: translate( 'New' ),
						[ FEATURE_WORDADS ]: translate( 'New' ),
						[ FEATURE_AI_WRITER_DESIGNER ]: translate( 'AI' ),
						[ FEATURE_PROFESSIONAL_EMAIL_FREE_YEAR ]: translate( 'New' ),
						[ FEATURE_EARLY_ONBOARDING_CALLS ]: translate( 'Free' ),
					};

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

						// Header features: "Everything in X, plus:" and "Included in plan:"
						const isEverythingInPlusFeature = featureSlug.startsWith( 'feature-everything-in' );
						const isIncludedInPlanFeature = featureSlug === 'feature-included-in-plan';
						const isHeaderFeature = isEverythingInPlusFeature || isIncludedInPlanFeature;

						// For var1d: mark features after header as differentiators
						const shouldMarkAsDifferentiator =
							isVar1dVariant && ! isHeaderFeature && passedHeaderFeature;

						// After we see a header feature, subsequent features are differentiators
						if ( isHeaderFeature ) {
							passedHeaderFeature = true;
						}

						// Get badge text for var1d variant
						const badgeText = isVar1dVariant ? var1dBadgeMap[ featureSlug ] : undefined;

						wpcomFeaturesTransformed.push( {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
							...( isHeaderFeature && { isHighlighted: true } ),
							...( isHeaderFeature && isVar1dVariant && { isHeaderFeature: true } ),
							...( shouldMarkAsDifferentiator && { isDifferentiatorFeature: true } ),
							...( badgeText && { badgeText } ),
						} );
					} );

					// Mark the last feature with variant-specific styling for bottom margin
					if ( wpcomFeaturesTransformed.length > 0 ) {
						const lastIndex = wpcomFeaturesTransformed.length - 1;
						if ( isVar1dVariant ) {
							wpcomFeaturesTransformed[ lastIndex ].isVar1dLastFeature = true;
						} else if ( isExperimentVariant ) {
							wpcomFeaturesTransformed[ lastIndex ].isExperimentLastFeature = true;
						}
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
		isSummerSpecial,
		useLongSetFeatures,
		useLongSetStackedFeatures,
		useShortSetStackedFeatures,
		useVar5Features,
		isExperimentVariant,
		isVar1dVariant,
		translate,
	] );
};

export default usePlanFeaturesForGridPlans;
