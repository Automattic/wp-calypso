import { formatCurrency, formatNumberCompact } from '@automattic/number-formatters';
import {
	Button,
	__experimentalDivider as Divider,
	ExternalLink,
	SelectControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Callout } from '../../../components/callout';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { a4aLink } from '../../../utils/link';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import { getProductPriceInfo } from '../products/lib/product-pricing';
import {
	BrandMark,
	CheckGrid,
	HostingFeatures,
	JetpackComplete,
	Testimonials,
} from './content-sections';
import demoIllustration from './demo-callout-illustration.svg';
import {
	PLAN_CATEGORY_PREMIUM,
	PRESSABLE_PROMOTION_TERMS_URL,
	PLAN_CATEGORY_SIGNATURE,
	PLAN_CATEGORY_STANDARD,
	areSignaturePlansFor,
	getDefaultPlanCategoryTab,
	getDefaultPlanSlug,
	getMinimumSelectableIndex,
	getPlanCategoryTabs,
	getPressablePlan,
	getPressablePlanName,
	isLowTabDisabled,
	isPremiumPlanSlug,
	isSignaturePlanSlug,
	sortPlansForCategory,
} from './lib/pressable-plans';
import OptionCards from './option-cards';
import PressablePremiumSection from './pressable-premium-section';
import PressableUsageCard from './pressable-usage-card';
import SelectedPlanCard from './selected-plan-card';
import { useKeyedSessionState, useSessionState } from './use-session-state';
import type { TermPricing } from '../use-term-pricing';
import type { PressablePlan } from './lib/pressable-plans';
import type { PressableOwnershipType } from './lib/pressable-products';
import type { AgencyProduct } from '@automattic/api-core';

const PRESSABLE_DEMO_URL = 'https://pressable.com/request-demo';
const CUSTOM_PLAN_OPTION = 'custom';

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

function getPlanOptionLabel( product: AgencyProduct, plan: PressablePlan ) {
	return sprintf(
		/* translators: %1$s is the plan name, %2$s the number of installs, %3$s the monthly visits, %4$d the storage in GB. */
		__( '%1$s · %2$s · %3$s visits · %4$dGB' ),
		getPressablePlanName( product.name ),
		sprintf(
			/* translators: %d is the number of WordPress installs. */
			_n( '%d install', '%d installs', plan.install ),
			plan.install
		),
		formatNumberCompact( plan.visits ),
		plan.storage
	);
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

	const existingPlanInfo = existingPlan ? getPressablePlan( existingPlan.slug ) : undefined;
	const areSignaturePlans = areSignaturePlansFor( existingPlanInfo, isReferralMode );
	// Referrals start from a clean slate: the agency's own plan sets no floor.
	const existingPressablePlan = isReferralMode ? undefined : existingPlanInfo;

	// Agencies on a legacy plan keep the legacy catalog, without the Premium plans.
	const catalog = useMemo(
		() =>
			products.filter( ( product ) =>
				areSignaturePlans
					? isSignaturePlanSlug( product.slug )
					: ! isSignaturePlanSlug( product.slug )
			),
		[ products, areSignaturePlans ]
	);
	const catalogPlans = useMemo(
		() =>
			catalog
				.map( ( product ) => getPressablePlan( product.slug ) )
				.filter( ( plan ): plan is PressablePlan => !! plan ),
		[ catalog ]
	);

	// Premium plans are only sold through referrals for now.
	const hasNewPremiumPlans =
		isReferralMode && catalog.some( ( product ) => isPremiumPlanSlug( product.slug ) );

	const defaultTab = getDefaultPlanCategoryTab( existingPressablePlan, areSignaturePlans );
	const [ storedTab, setSelectedTab ] = useSessionState( 'pressable-tab', defaultTab );
	const tabs = getPlanCategoryTabs( areSignaturePlans, hasNewPremiumPlans );
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
	const minimumIndex = getMinimumSelectableIndex( selectedTab, tabOptions, existingPressablePlan );
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
			if ( getPressablePlan( existingPlan.slug )?.category === selectedTab ) {
				setSelectedSlug( existingPlan.slug );
				persistSlug( selectedTab, existingPlan.slug );
				return;
			}
		}
		const defaultSlug = getDefaultPlanSlug( selectedTab, areSignaturePlans );
		const defaultProduct = catalog.find( ( product ) => product.slug === defaultSlug );
		setSelectedSlug(
			defaultProduct?.slug ?? ( isReferralMode ? null : tabOptions[ 0 ]?.slug ?? null )
		);
	}, [
		catalog,
		tabOptions,
		selectedTab,
		getPersistedSlug,
		persistSlug,
		isReferralMode,
		existingPlan,
		areSignaturePlans,
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
	const selectedPlanInfo = selectedProduct ? getPressablePlan( selectedProduct.slug ) : undefined;
	const isCustomPlan = selectedSlug === null;
	const showPremiumSection = selectedTab === PLAN_CATEGORY_PREMIUM && ! hasNewPremiumPlans;

	const disableLowTab = isLowTabDisabled( existingPressablePlan, lowOptions );

	const showUsage = !! existingPlan && ! isReferralMode;

	const priceInfo = selectedProduct
		? getProductPriceInfo( selectedProduct, term, {
				applyIntroductoryPrice: isReferralMode || ownership !== 'agency',
		  } )
		: undefined;
	const hasIntroductoryDiscount = !! priceInfo && priceInfo.regularPrice !== undefined;

	const planName = selectedProduct ? getPressablePlanName( selectedProduct.name ) : __( 'Custom' );

	const getPlanDetailsIntro = () => {
		if ( isReferralMode ) {
			return __(
				'When you refer a Pressable plan to your client, they’ll pay and manage the billing. You’ll manage the site, and make a recurring commission.'
			);
		}
		return __( 'Your traffic and storage limits are shared amongst your total sites.' );
	};

	const renderPlanDetails = () => (
		<VStack spacing={ 3 }>
			<Text variant="muted">{ getPlanDetailsIntro() }</Text>
			{ isCustomPlan || ! selectedPlanInfo ? (
				<CheckGrid
					items={ [
						__( 'Custom WordPress installs' ),
						__( 'Custom visits per month*' ),
						__( 'Custom storage per month*' ),
						__( 'Unmetered bandwidth' ),
					] }
				/>
			) : (
				<CheckGrid
					columns={ 3 }
					items={ [
						sprintf(
							/* translators: %d is the number of WordPress installs. */
							_n(
								'Up to %d WordPress install',
								'Up to %d WordPress installs',
								selectedPlanInfo.install
							),
							selectedPlanInfo.install
						),
						sprintf(
							/* translators: %d is the number of staging sites. */
							_n( 'Up to %d staging site', 'Up to %d staging sites', selectedPlanInfo.install ),
							selectedPlanInfo.install
						),
						sprintf(
							/* translators: %s is the number of visits. */
							__( '%s visits per month*' ),
							formatNumberCompact( selectedPlanInfo.visits )
						),
						sprintf(
							/* translators: %d is the size of storage in GB. */
							__( '%dGB of storage*' ),
							selectedPlanInfo.storage
						),
						sprintf(
							/* translators: %d is the number of PHP workers. */
							__( '%d base PHP workers' ),
							selectedPlanInfo.worker ?? 5
						),
						__( 'Unmetered bandwidth' ),
					] }
				/>
			) }
			<Text variant="muted" size={ 12 }>
				{ sprintf(
					/* translators: %1$s is the charge per GB, %2$s the charge per %3$s visits. */
					__(
						'*If you exceed your plan’s storage or traffic limits, you will be charged %1$s per GB and %2$s per %3$s visits per month.'
					),
					formatCurrency( 0.5, 'USD' ),
					formatCurrency( 8, 'USD' ),
					formatNumberCompact( 10000 )
				) }
			</Text>
		</VStack>
	);

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
			<VStack spacing={ 8 } justify="flex-start">
				<VStack spacing={ 4 }>
					{ showUsage && <PressableUsageCard existingPlan={ existingPlan } /> }
					<Card>
						<CardHeader>
							<SectionHeader
								className="dashboard-marketplace-hosting__card-header"
								level={ 3 }
								title={
									existingPlan && ! isReferralMode
										? __( 'Upgrade your plan' )
										: __( 'Purchase Pressable' )
								}
								description={ __(
									'One pooled plan shares installs, traffic, and storage across your whole portfolio.'
								) }
								decoration={ <BrandMark src={ pressableDescriptor } /> }
							/>
						</CardHeader>
						<CardBody>
							<VStack spacing={ 5 }>
								<VStack spacing={ 3 }>
									<Heading level={ 4 } size={ 13 }>
										{ __( 'Choose a plan type' ) }
									</Heading>
									<OptionCards
										label={ __( 'Plan type' ) }
										options={ tabs.map( ( tab ) => ( {
											value: tab.key,
											label: tab.label,
											description: tab.description,
											disabled: tab.key === lowCategory && disableLowTab,
										} ) ) }
										selected={ selectedTab }
										onSelect={ setSelectedTab }
									/>
								</VStack>
								{ ! showPremiumSection && (
									<VStack spacing={ 3 }>
										<Heading level={ 4 } size={ 13 }>
											{ __( 'Select your plan' ) }
										</Heading>
										<SelectControl
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											label={ __( 'Select your plan' ) }
											hideLabelFromVision
											value={ isCustomPlan ? CUSTOM_PLAN_OPTION : selectedSlug ?? '' }
											options={ [
												...tabOptions.map( ( plan, index ) => {
													const product = catalog.find(
														( candidate ) => candidate.slug === plan.slug
													);
													return {
														value: plan.slug,
														label: product ? getPlanOptionLabel( product, plan ) : plan.slug,
														disabled: index < minimumIndex,
													};
												} ),
												...( hasCustomOption
													? [ { value: CUSTOM_PLAN_OPTION, label: __( 'Custom' ) } ]
													: [] ),
											] }
											onChange={ selectPlan }
										/>
									</VStack>
								) }
								<CardDivider />
								{ showPremiumSection ? <PressablePremiumSection /> : renderPlanDetails() }
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
			{ ! showPremiumSection && (
				<div className="dashboard-marketplace-hosting__rail">{ renderRail() }</div>
			) }
		</div>
	);
}
