import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	ExternalLink,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Callout } from '../../../components/callout';
import { Card, CardBody } from '../../../components/card';
import Divider from '../../../components/divider';
import { a4aLink } from '../../../utils/link';
import { getProductPriceInfo } from '../products/lib/product-pricing';
import { CheckGrid, HostingFeatures, JetpackComplete, Testimonials } from './content-sections';
import demoIllustration from './demo-callout-illustration.svg';
import {
	PLAN_CATEGORY_PREMIUM,
	PRESSABLE_PROMOTION_TERMS_URL,
	PLAN_CATEGORY_SIGNATURE,
	PLAN_CATEGORY_STANDARD,
	areSignaturePlansFor,
	getDefaultPlanCategoryTab,
	getMinimumSelectableIndex,
	getPlanCategoryTabs,
	getPressablePlanInfo,
	getPressablePlanName,
	isLowTabDisabled,
	isSignatureCatalogPlan,
	sortPlansForCategory,
} from './lib/pressable-plans';
import OptionCards from './option-cards';
import PressablePlanTable, { CUSTOM_PLAN_OPTION } from './pressable-plan-table';
import PressablePremiumGate from './pressable-premium-gate';
import PressableUsageCard from './pressable-usage-card';
import SelectedPlanCard from './selected-plan-card';
import StepHeading from './step-heading';
import { useKeyedSessionState, useSessionState } from './use-session-state';
import type { TermPricing } from '../use-term-pricing';
import type { PressablePlan } from './lib/pressable-plans';
import type { PressableOwnershipType } from './lib/pressable-products';
import type { PlanRow } from './pressable-plan-table';
import type { AgencyProduct } from '@automattic/api-core';

const PRESSABLE_DEMO_URL = 'https://pressable.com/request-demo';

interface Props {
	/** The Pressable hosting plans in the catalog. */
	products: AgencyProduct[];
	/** The plan the agency bought for itself, if any. */
	existingPlan?: AgencyProduct;
	ownership: PressableOwnershipType;
	term: TermPricing;
	isReferralMode: boolean;
	onAddToCart: ( plan: AgencyProduct, quantity: number ) => void;
}

/** What the Premium gate names when nothing is picked: Custom, or the agency's own Premium plan on the legacy catalog. */
function getPremiumGateLabel(
	selectedProduct: AgencyProduct | undefined,
	hasPremiumPlans: boolean,
	existingPlan: AgencyProduct | undefined
) {
	if ( selectedProduct ) {
		return selectedProduct.name;
	}
	if ( hasPremiumPlans ) {
		return __( 'Pressable Custom' );
	}
	return existingPlan && getPressablePlanInfo( existingPlan )?.category === PLAN_CATEGORY_PREMIUM
		? existingPlan.name
		: __( 'Pressable Premium' );
}

// The first plan of a category the agency can move up to, as in the classic
// plan picker. Premium is one dedicated site sold to a client, not a step up
// from a pooled plan, so only a Premium plan sets a floor on it.
function getPlanFloor(
	category: string,
	options: PressablePlan[],
	existingPlan: PressablePlan | undefined
) {
	if ( category === PLAN_CATEGORY_PREMIUM && existingPlan?.category !== PLAN_CATEGORY_PREMIUM ) {
		return 0;
	}
	return getMinimumSelectableIndex( category, options, existingPlan );
}

function ScheduleDemoCallout() {
	const { recordTracksEvent } = useAnalytics();
	return (
		<Callout
			title={ __( 'Want a guided tour? Schedule a demo' ) }
			titleAs="h3"
			description={
				<Text variant="muted">
					{ __(
						'Our experts are happy to give you a one-on-one tour of our platform and the free perks that come with Pressable.'
					) }
				</Text>
			}
			image={ demoIllustration }
			imageAlt=""
			imageVariant="full-bleed"
			actions={
				<Button
					variant="secondary"
					size="compact"
					href={ PRESSABLE_DEMO_URL }
					target="_blank"
					rel="noreferrer"
					onClick={ () =>
						recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_schedule_demo_click' )
					}
				>
					{ __( 'Schedule a demo ↗' ) }
				</Button>
			}
		/>
	);
}

export default function PressableSection( {
	products,
	existingPlan,
	ownership,
	term,
	isReferralMode,
	onAddToCart,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();

	const existingPlanInfo = useMemo(
		() => ( existingPlan ? getPressablePlanInfo( existingPlan ) : undefined ),
		[ existingPlan ]
	);
	const areSignaturePlans = areSignaturePlansFor( existingPlanInfo, isReferralMode );
	// Referrals start from a clean slate: the agency's own plan sets no floor.
	const existingPressablePlan = isReferralMode ? undefined : existingPlanInfo;

	// Agencies on a legacy plan keep the legacy catalog, without the Premium plans.
	const catalog = useMemo(
		() =>
			products.filter( ( product ) => {
				const plan = getPressablePlanInfo( product );
				return !! plan && isSignatureCatalogPlan( plan ) === areSignaturePlans;
			} ),
		[ products, areSignaturePlans ]
	);
	const catalogPlans = useMemo(
		() => catalog.map( getPressablePlanInfo ).filter( ( plan ): plan is PressablePlan => !! plan ),
		[ catalog ]
	);

	const hasPremiumPlans = catalogPlans.some( ( plan ) => plan.category === PLAN_CATEGORY_PREMIUM );

	const defaultTab = getDefaultPlanCategoryTab( existingPressablePlan, areSignaturePlans );
	const [ storedTab, setSelectedTab ] = useSessionState( 'pressable-tab', defaultTab );
	const tabs = getPlanCategoryTabs( areSignaturePlans, hasPremiumPlans );
	// The stored tab is shared with classic and may not exist in this catalog
	// (e.g. after toggling referral mode), so fall back like classic's TabPanel.
	const selectedTab = tabs.some( ( tab ) => tab.key === storedTab ) ? storedTab : defaultTab;
	const { getValue: getPersistedSlug, setValue: persistSlug } =
		useKeyedSessionState< string >( 'pressable-plan' );
	// `null` is the custom plan; `undefined` means nothing is chosen yet.
	const [ selectedSlug, setSelectedSlug ] = useState< string | null | undefined >( undefined );

	const lowCategory = areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD;
	const lowOptions = useMemo(
		() => sortPlansForCategory( catalogPlans, lowCategory ),
		[ catalogPlans, lowCategory ]
	);
	const tabOptions = useMemo(
		() => sortPlansForCategory( catalogPlans, selectedTab ),
		[ catalogPlans, selectedTab ]
	);
	const minimumIndex = getPlanFloor( selectedTab, tabOptions, existingPressablePlan );
	const isLowTab = selectedTab === lowCategory;
	const hasCustomOption = ! isLowTab;

	// Restore the plan chosen on this tab, else start from the agency's plan, else the tab's default.
	const hasUsedExistingPlan = useRef( false );
	useEffect( () => {
		if ( catalog.length === 0 ) {
			return;
		}
		const persisted = getPersistedSlug( selectedTab );
		if ( persisted && catalog.some( ( product ) => product.slug === persisted ) ) {
			setSelectedSlug( persisted );
			return;
		}
		if ( ! isReferralMode && existingPlan && ! hasUsedExistingPlan.current ) {
			hasUsedExistingPlan.current = true;
			if ( existingPlanInfo?.category === selectedTab ) {
				setSelectedSlug( existingPlan.slug );
				persistSlug( selectedTab, existingPlan.slug );
				return;
			}
		}
		setSelectedSlug( tabOptions[ 0 ]?.slug ?? null );
	}, [
		catalog,
		tabOptions,
		selectedTab,
		getPersistedSlug,
		persistSlug,
		isReferralMode,
		existingPlan,
		existingPlanInfo,
	] );

	// Plans below the agency's current plan can't be picked: bump the selection up to the first one that can.
	useEffect( () => {
		if ( ! selectedSlug ) {
			return;
		}
		const index = tabOptions.findIndex( ( plan ) => plan.slug === selectedSlug );
		if ( index >= 0 && index < minimumIndex && minimumIndex < tabOptions.length ) {
			setSelectedSlug( tabOptions[ minimumIndex ].slug );
		}
	}, [ selectedSlug, tabOptions, minimumIndex ] );

	const selectPlan = ( value: string ) => {
		const slug = value === CUSTOM_PLAN_OPTION ? null : value;
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_select_plan', {
			slug: slug ?? undefined,
		} );
		setSelectedSlug( slug );
		if ( slug ) {
			persistSlug( selectedTab, slug );
		}
	};

	const selectedProduct = selectedSlug
		? catalog.find( ( product ) => product.slug === selectedSlug )
		: undefined;
	const isCustomPlan = selectedSlug === null;
	const isPremiumTab = selectedTab === PLAN_CATEGORY_PREMIUM;
	// Agencies on a legacy plan have no Premium plans to pick from.
	const hasPlanPicker = ! isPremiumTab || hasPremiumPlans;
	// Premium plans are only sold through referrals for now.
	const showPremiumGate = isPremiumTab && ! isReferralMode;

	const disableLowTab = isLowTabDisabled( existingPressablePlan, lowOptions );

	const showUsage = !! existingPlan && ! isReferralMode;

	const priceInfo = selectedProduct
		? getProductPriceInfo( selectedProduct, term, {
				applyIntroductoryPrice: isReferralMode || ownership !== 'agency',
			} )
		: undefined;
	const hasIntroductoryDiscount = !! priceInfo && priceInfo.regularPrice !== undefined;

	const planName = selectedProduct ? getPressablePlanName( selectedProduct.name ) : __( 'Custom' );

	const gateLabel = getPremiumGateLabel( selectedProduct, hasPremiumPlans, existingPlan );

	// Plans below the agency's own can't be bought: they are left out, and the
	// plan it owns stays in the list, marked as its current plan.
	const planRows = tabOptions
		.filter( ( plan, index ) => index >= minimumIndex || plan.slug === existingPressablePlan?.slug )
		.map( ( plan ) => ( {
			plan,
			product: catalog.find( ( candidate ) => candidate.slug === plan.slug ),
		} ) )
		.filter( ( row ): row is PlanRow => !! row.product );

	const premiumOptions = sortPlansForCategory( catalogPlans, PLAN_CATEGORY_PREMIUM );
	const isPremiumTabBelowPlan =
		existingPressablePlan?.category === PLAN_CATEGORY_PREMIUM &&
		getPlanFloor( PLAN_CATEGORY_PREMIUM, premiumOptions, existingPressablePlan ) >=
			premiumOptions.length;

	const planTypeOptions = tabs.map( ( tab ) => {
		const isBelowPlan =
			( tab.key === lowCategory && disableLowTab ) ||
			( tab.key === PLAN_CATEGORY_PREMIUM && isPremiumTabBelowPlan );
		let tag;
		if ( isBelowPlan ) {
			tag = __( 'Below your plan' );
		} else if ( tab.key === PLAN_CATEGORY_PREMIUM && ! isReferralMode ) {
			tag = __( 'Referral only' );
		}
		return {
			value: tab.key,
			label: tab.label,
			description: tab.description,
			disabled: isBelowPlan,
			tag,
		};
	} );

	const renderRail = () => {
		if ( isCustomPlan || ! selectedProduct || ! priceInfo ) {
			return (
				<SelectedPlanCard
					label={ __( 'Pressable Custom' ) }
					price={
						<Text size={ 24 } weight={ 600 }>
							{ __( 'Custom pricing' ) }
						</Text>
					}
					assurance={
						isReferralMode
							? __( 'Commission on every payment your client makes, paid out quarterly.' )
							: undefined
					}
					action={
						// TODO: The MSD has no contact-support widget yet; this opens the
						// classic hosting page with the widget's hash fragment.
						<Button
							variant="primary"
							__next40pxDefaultSize
							href={ a4aLink( '/marketplace/hosting/pressable#contact-support-a4a' ) }
						>
							{ isReferralMode ? __( 'Contact us to refer' ) : __( 'Contact us' ) }
						</Button>
					}
				/>
			);
		}

		const isCurrentPlan = ! isReferralMode && existingPlan?.slug === selectedProduct.slug;
		const isUpgrade = ! isReferralMode && !! existingPlan && ! isCurrentPlan;
		const getCtaLabel = () => {
			if ( isReferralMode ) {
				/* translators: %s is the name of the plan. */
				return sprintf( __( 'Add %s to referral' ), planName );
			}
			if ( isCurrentPlan ) {
				return __( 'Your current plan' );
			}
			if ( isUpgrade ) {
				/* translators: %s is the name of the plan. */
				return sprintf( __( 'Upgrade to %s' ), planName );
			}
			/* translators: %s is the name of the plan. */
			return sprintf( __( 'Add %s to cart' ), planName );
		};
		const ctaLabel = getCtaLabel();
		const termSuffix = term === 'yearly' ? __( '/year' ) : __( '/month' );

		return (
			<SelectedPlanCard
				label={ selectedProduct.name }
				price={
					<Text size={ 24 } weight={ 600 } className="dashboard-marketplace-hosting__rail-price">
						<span>{ formatCurrency( priceInfo.price, selectedProduct.currency ) }</span>
						<Text as="span" variant="muted" size={ 13 } weight={ 400 }>
							{ termSuffix }
						</Text>
					</Text>
				}
				notes={
					<VStack spacing={ 1 }>
						{ hasIntroductoryDiscount && (
							<Text variant="muted">
								<s>{ formatCurrency( priceInfo.regularPrice ?? 0, selectedProduct.currency ) }</s>
								<span>
									{ ' · ' +
										sprintf(
											/* translators: %s is the amount saved, e.g. "US$125.00". The asterisk marks a limited time offer. */
											__( 'Save %s*' ),
											formatCurrency(
												( priceInfo.regularPrice ?? 0 ) - priceInfo.price,
												selectedProduct.currency
											)
										) }
								</span>
							</Text>
						) }
						{ isUpgrade && existingPlan && (
							<Text variant="muted">
								{ sprintf(
									/* translators: %s is the name of the plan the agency owns today. */
									__( 'Replaces your current %s plan.' ),
									getPressablePlanName( existingPlan.name )
								) }
							</Text>
						) }
					</VStack>
				}
				assurance={
					isReferralMode
						? __( 'Commission on every payment your client makes, paid out quarterly.' )
						: __( 'Cancel anytime.' )
				}
				action={
					<Button
						variant="primary"
						__next40pxDefaultSize
						disabled={ isCurrentPlan }
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_select_plan_click', {
								slug: selectedProduct.slug,
							} );
							onAddToCart( selectedProduct, 1 );
						} }
					>
						{ ctaLabel }
					</Button>
				}
				footnote={
					hasIntroductoryDiscount ? (
						<Text variant="muted" size={ 12 }>
							{ createInterpolateElement( __( '*Limited time only. <a>See details</a>' ), {
								a: <ExternalLink href={ PRESSABLE_PROMOTION_TERMS_URL } children={ null } />,
							} ) }
						</Text>
					) : undefined
				}
			/>
		);
	};

	return (
		<div className="dashboard-marketplace-hosting__layout">
			<VStack spacing={ 8 } justify="flex-start" className="dashboard-marketplace-hosting__main">
				<VStack spacing={ 4 }>
					<Card>
						<CardBody>
							<VStack spacing={ 6 }>
								<VStack spacing={ 4 }>
									<StepHeading step={ 1 }>{ __( 'Choose a plan type' ) }</StepHeading>
									<OptionCards
										label={ __( 'Plan type' ) }
										options={ planTypeOptions }
										selected={ selectedTab }
										onSelect={ setSelectedTab }
									/>
								</VStack>
								{ hasPlanPicker && (
									<VStack spacing={ 4 }>
										<StepHeading step={ 2 }>{ __( 'Select your plan' ) }</StepHeading>
										<PressablePlanTable
											rows={ planRows }
											withCustom={ hasCustomOption }
											selected={ isCustomPlan ? CUSTOM_PLAN_OPTION : ( selectedSlug ?? '' ) }
											currentSlug={ existingPressablePlan?.slug }
											isPremium={ isPremiumTab }
											onSelect={ selectPlan }
										/>
										{ isCustomPlan && (
											<CheckGrid
												items={ [
													__( 'Custom WordPress installs' ),
													__( 'Custom visits per month' ),
													__( 'Custom storage per month' ),
													__( 'Unmetered bandwidth' ),
												] }
											/>
										) }
									</VStack>
								) }
							</VStack>
						</CardBody>
					</Card>
					<ScheduleDemoCallout />
				</VStack>
				<Divider style={ { color: 'var(--dashboard-overview__divider-color)' } } />
				<HostingFeatures brand="pressable" />
				<JetpackComplete />
				<Testimonials brand="pressable" />
			</VStack>
			<VStack spacing={ 4 } justify="flex-start" className="dashboard-marketplace-hosting__rail">
				{ showPremiumGate ? <PressablePremiumGate label={ gateLabel } /> : renderRail() }
				{ showUsage && <PressableUsageCard existingPlan={ existingPlan } /> }
			</VStack>
		</div>
	);
}
