import {
	Button,
	ExternalLink,
	SelectControl,
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Stat } from '../../../components/stat';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import { ButtonStack } from '../../../components/button-stack';
import { CheckGrid } from './content-sections';
import {
	brandBlurb,
	tabLineMark,
	pressablePlans,
	usesSignatureCatalog,
	PRESSABLE_OVERAGES,
	formatUSD,
	formatCompactNumber,
} from './mock-data';
import OptionCards from './option-cards';
import type { PressablePlan } from './mock-data';

export type TitanOrder = {
	domain: string;
	status: 'active' | 'cancelled';
	billable_inboxes: number;
	trial_end_at: string | null;
};

export type PressableUsage = {
	sites: number;
	visits: number;
	storageGB: number;
	titanOrders?: TitanOrder[];
};

export const PRESSABLE_CUSTOM_SLUG = 'pressable-custom';

export type PlanCategory =
	| 'standard'
	| 'enterprise'
	| 'custom'
	| 'signature'
	| 'signature-high'
	| 'premium';

const PLAN_TYPE_OPTIONS: { value: PlanCategory; label: string; description: string }[] = [
	{
		value: 'standard',
		label: __( 'Standard' ),
		description: __(
			'Traffic and storage pooled across all your client sites, from 1 to 150 installs.'
		),
	},
	{
		value: 'enterprise',
		label: __( 'Enterprise' ),
		description: __( 'For large portfolios of 200 to 500 WordPress installs.' ),
	},
	{
		value: 'custom',
		label: __( 'Custom' ),
		description: __(
			'More than 500 installs or 10M visits per month? We’ll size a plan to your portfolio.'
		),
	},
];

// Yashwin's three plan types from trunk (client/dashboard/agency/marketplace/
// hosting/lib/pressable-plans.ts, getPlanCategoryTabs), copied. Custom is not
// a type there: it is the last option of the plan dropdown.
const SIGNATURE_TYPE_OPTIONS: { value: PlanCategory; label: string; description: string }[] = [
	{
		value: 'signature',
		label: __( 'Signature plans 1–10' ),
		description: __(
			'Traffic and storage pooled across all your client sites, from 1 to 150 installs.'
		),
	},
	{
		value: 'signature-high',
		label: __( 'Signature plans 11–17' ),
		description: __( 'For large portfolios of 200 to 500 WordPress installs.' ),
	},
	{
		value: 'premium',
		label: __( 'Premium plans' ),
		description: __(
			'Dedicated resources for one high-traffic site, from 150K to 10M visits per month.'
		),
	},
];

// Premium plans are sold through referral only. With referral mode off, Main
// replaces the plan form with this pitch (client/a8c-for-agencies/sections/
// marketplace/hosting-overview/hosting-content/premier-agency-hosting/
// pressable-plan-section/premium-plan-section.tsx) and hides the price rail;
// Yashwin carried it over as-is (pressable-premium-section.tsx). Copy and the
// US$350 starting price are Main's. ?premium=gate keeps the form and moves the
// referral ask into the rail instead (see PremiumGateRail).
export const PREMIUM_COMMISSION = 20;
const PREMIUM_FROM = 350;
const PREMIUM_FEATURES = [
	__( 'Support up to millions of visits per month' ),
	__( 'Starting at 10 base PHP Workers (5 vCPUs) per site' ),
	__( '512MB for each PHP worker/process' ),
	__( 'Vertical scaling with bursting to 100+ cores' ),
	__( 'Custom storage with add-on capabilities' ),
	__( 'Geo-redundant HA cloud' ),
	__( 'AMD EPYC Milan CPUs (64 core/128 thread)' ),
	__( 'Enterprise-level caching solutions' ),
	__( 'Smart plugin update schedules' ),
	__( 'Health & performance reports' ),
	__( 'Hourly & daily automated backups' ),
	__( 'Robust REST-based API, plus Git integration' ),
];

// Sept 23: Noam chose the gate; ?premium=pitch keeps Main's pitch for comparison.
export function premiumTreatment(): 'pitch' | 'gate' {
	return new URLSearchParams( window.location.search ).get( 'premium' ) === 'pitch'
		? 'pitch'
		: 'gate';
}

// The Premium sell: starting price, commission and the feature list. Shown
// under the pitch and, in the gate, under the selected plan's specs.
function PremiumDetails() {
	return (
		<VStack spacing={ 3 }>
			<VStack spacing={ 1 }>
				<Heading level={ 4 } size={ 13 }>
					{ sprintf(
						/* translators: %1$s is the starting price, %2$d the commission percentage. */
						__( 'Premium plans from %1$s per month. Get %2$d%% commission when you refer.' ),
						formatUSD( PREMIUM_FROM ).replace( '.00', '' ),
						PREMIUM_COMMISSION
					) }
				</Heading>
				<Text variant="muted">{ __( 'per site, when billed monthly' ) }</Text>
			</VStack>
			<CheckGrid items={ PREMIUM_FEATURES } />
		</VStack>
	);
}

// Premium in the gate: the selected plan's numbers on one line (a Premium
// plan is one site, so the pooled-limits copy does not apply), then the
// feature list. The price and commission are in the rail.
function PremiumSpecs( { plan }: { plan?: PressablePlan } ) {
	return (
		<VStack spacing={ 3 }>
			{ plan && (
				<Text variant="muted">
					{ sprintf(
						/* translators: 1: visits per month, 2: storage in GB, 3: base PHP workers */
						__( 'One site · %1$s visits per month · %2$dGB storage · %3$d base PHP workers' ),
						formatCompactNumber( plan.visits ),
						plan.storage,
						plan.worker
					) }
				</Text>
			) }
			<CheckGrid items={ PREMIUM_FEATURES } />
		</VStack>
	);
}

function PremiumPitch( { onReferNow }: { onReferNow: () => void } ) {
	return (
		<VStack spacing={ 5 }>
			<VStack spacing={ 3 }>
				<Heading level={ 4 } size={ 16 }>
					{ sprintf(
						/* translators: %d is the commission percentage. */
						__( 'Earn %d%% on Premium Plan Referrals' ),
						PREMIUM_COMMISSION
					) }
				</Heading>
				<Text variant="muted">
					{ __( 'For mission critical sites that demand extra attention and resources.' ) }
				</Text>
				<ButtonStack justify="flex-start" expanded={ false } wrap>
					<Button variant="primary" __next40pxDefaultSize onClick={ onReferNow }>
						{ __( 'Refer now and get rewarded' ) }
					</Button>
					<Button
						variant="secondary"
						__next40pxDefaultSize
						href="https://pressable.com/contact/"
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Buying for your agency? Talk to us ↗' ) }
					</Button>
				</ButtonStack>
			</VStack>
			<PremiumDetails />
		</VStack>
	);
}

// ?premium=gate: the plan form stays (Premium 1-11, specs), and the rail says
// why there is no Add to cart. Rendered from hosting/index.tsx in the rail.
export function PremiumGateRail( {
	plan,
	onReferNow,
}: {
	plan?: PressablePlan;
	onReferNow: () => void;
} ) {
	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ __( 'Currently selected' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="flex-start">
					<Text weight={ 500 }>
						{ sprintf(
							/* translators: %s: plan name */
							__( 'Pressable %s' ),
							plan?.name ?? __( 'Premium' )
						) }
					</Text>
					<Text variant="muted">
						{ sprintf(
							/* translators: %d is the commission percentage. */
							__(
								'Premium plans are sold through referrals. Turn on Refer products to refer this plan to a client and earn %d%% commission on every payment.'
							),
							PREMIUM_COMMISSION
						) }
					</Text>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Refer products' ) }
						checked={ false }
						onChange={ onReferNow }
					/>
					<CardDivider />
					<ExternalLink href="https://pressable.com/contact/">
						{ __( 'Buying for your agency? Talk to us' ) }
					</ExternalLink>
				</VStack>
			</CardBody>
		</Card>
	);
}

function planOptionLabel( plan: PressablePlan ) {
	const installs = sprintf(
		/* translators: %d: number of WordPress installs */
		_n( '%d install', '%d installs', plan.install ),
		plan.install
	);
	return sprintf(
		/* translators: %1$s: plan name, %2$s: installs, %3$s: monthly visits, %4$d: storage in GB */
		__( '%1$s · %2$s · %3$s visits · %4$dGB' ),
		plan.name,
		installs,
		formatCompactNumber( plan.visits ),
		plan.storage
	);
}

function PlanSpecs( {
	category,
	plan,
	isCustom = false,
}: {
	category: PlanCategory;
	plan?: PressablePlan;
	isCustom?: boolean;
} ) {
	if ( category === 'custom' || isCustom ) {
		return (
			<VStack spacing={ 3 }>
				<Heading level={ 3 } size={ 13 }>
					{ __( 'Custom' ) }
				</Heading>
				<CheckGrid
					items={ [
						__( 'Custom WordPress installs' ),
						__( 'Custom visits per month' ),
						__( 'Custom storage per month' ),
						__( 'Unmetered bandwidth' ),
					] }
				/>
			</VStack>
		);
	}

	if ( ! plan ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<Text variant="muted">
				{ __( 'Your traffic and storage limits are shared amongst your total sites.' ) }
			</Text>
			<CheckGrid
				columns={ 3 }
				items={ [
					sprintf(
						/* translators: %d: number of WordPress installs */
						_n( 'Up to %d WordPress install', 'Up to %d WordPress installs', plan.install ),
						plan.install
					),
					sprintf(
						/* translators: %d: number of staging sites */
						_n( 'Up to %d staging site', 'Up to %d staging sites', plan.install ),
						plan.install
					),
					sprintf(
						/* translators: %s: number of visits per month */
						__( '%s visits per month*' ),
						formatCompactNumber( plan.visits )
					),
					sprintf(
						/* translators: %d: storage in GB */
						__( '%dGB of storage*' ),
						plan.storage
					),
					sprintf(
						/* translators: %d: number of base PHP workers */
						__( '%d base PHP workers' ),
						plan.worker
					),
					__( 'Unmetered bandwidth' ),
				] }
			/>
			<Text variant="muted" size={ 12 }>
				{ sprintf(
					/* translators: %1$s: charge per GB, %2$s: charge per 10K visits */
					__(
						'*If you exceed your plan’s storage or traffic limits, you will be charged %1$s per GB and %2$s per 10K visits per month.'
					),
					formatUSD( PRESSABLE_OVERAGES.storagePerGB ),
					formatUSD( PRESSABLE_OVERAGES.trafficPer10kVisits )
				) }
			</Text>
		</VStack>
	);
}

// A4AD-205. Titan Email is Pressable's email add-on; an agency buys inboxes per
// domain, in Pressable. Main shows a "Titan Email" block in the usage card
// (client/a8c-for-agencies/components/pressable-usage-details) only when the
// agency has active inboxes: total count, "$3.50 per inbox monthly" typed into
// the code (the products API has no Titan product), then one row per domain
// with a plan label, a trial badge and its end date. Yashwin carried that block
// into MSD under the usage stats (#114263). Three treatments, ?titan=:
//   stack  Yashwin's block, as built: divider, "Titan Email" + add-on badge,
//          inbox count and price, one row per domain.            (default)
//   stat   Inboxes as a fourth usage stat in the card's own grammar, domains
//          as its description. No price: the card reports usage, and a USD
//          number the API cannot localise does not belong on it.
//   card   Its own "Titan Email" card under the plan card, one row per
//          domain with the trial as a status, and Manage in Pressable.
//   rail   The plan card and the Titan card from "card", moved into the
//          right column under Currently selected, so what you own sits
//          beside what you are buying and the main column is only the
//          purchase form. Rendered from hosting/index.tsx.
// Sept 23: Noam chose the card (C) as the default and the rail (D) as the
// open alternative; stack and stat were dropped.
export function getTitanTreatment(): 'card' | 'rail' {
	return new URLSearchParams( window.location.search ).get( 'titan' ) === 'rail' ? 'rail' : 'card';
}

export function activeTitanOrders( usage?: PressableUsage ) {
	return ( usage?.titanOrders ?? [] ).filter( ( o ) => o.status === 'active' );
}

function formatTrialEnd( iso: string ) {
	return new Intl.DateTimeFormat( 'en-US', {
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	} ).format( new Date( iso ) );
}

function inboxCount( n: number ) {
	return sprintf(
		/* translators: %d is a number of email inboxes. */
		_n( '%d inbox', '%d inboxes', n ),
		n
	);
}

// card: Titan Email as its own card, the way each hosting product gets its
// own card on this page. Rows are domains; the trial is a status, not a
// sentence. Pricing and adding inboxes happen in Pressable, so the action
// goes there.
export function TitanCard( { orders }: { orders: TitanOrder[] } ) {
	if ( orders.length === 0 ) {
		return null;
	}
	const total = orders.reduce( ( sum, o ) => sum + o.billable_inboxes, 0 );
	return (
		<Card>
			<CardHeader>
				<SectionHeader
					className="marketplace-hosting__card-header"
					level={ 3 }
					title={ __( 'Titan Email' ) }
					description={ sprintf(
						/* translators: 1: "N inboxes", 2: "across N domains" */
						__( '%1$s %2$s' ),
						inboxCount( total ),
						sprintf(
							/* translators: %d is a number of domains. */
							_n( 'across %d domain', 'across %d domains', orders.length ),
							orders.length
						)
					) }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 3 }>
					{ orders.map( ( order, index ) => (
						<VStack key={ order.domain } spacing={ 3 }>
							{ index > 0 && <CardDivider /> }
							<HStack justify="space-between" alignment="center">
								<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
									<Text weight={ 500 }>{ order.domain }</Text>
									{ order.trial_end_at && (
										<Text variant="muted">
											{ sprintf(
												/* translators: %s is a date. */
												__( 'Trial ends %s' ),
												formatTrialEnd( order.trial_end_at )
											) }
										</Text>
									) }
								</HStack>
								<Text variant="muted">{ inboxCount( order.billable_inboxes ) }</Text>
							</HStack>
						</VStack>
					) ) }
					<CardDivider />
					<div>
						<Button variant="link" href="https://my.pressable.com" target="_blank" rel="noreferrer">
							{ __( 'Manage in Pressable ↗' ) }
						</Button>
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}

export function CurrentPlanCard( { plan, usage }: { plan: PressablePlan; usage: PressableUsage } ) {
	const sitesPercent = Math.round( ( usage.sites / plan.install ) * 100 );
	const visitsPercent = Math.round( ( usage.visits / plan.visits ) * 100 );
	const storagePercent = Math.round( ( usage.storageGB / plan.storage ) * 100 );

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 3 }
					title={ sprintf(
						/* translators: %s: plan name */
						__( 'Your Pressable %s plan' ),
						plan.name
					) }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<Stat
						density="high"
						strapline={ __( 'Sites created' ) }
						metric={ String( usage.sites ) }
						description={ sprintf(
							/* translators: %d: maximum number of sites */
							__( 'of %d' ),
							plan.install
						) }
						progressValue={ sitesPercent }
						progressLabel={ `${ sitesPercent }%` }
					/>
					<Stat
						density="high"
						strapline={ __( 'Visits this month' ) }
						metric={ formatCompactNumber( usage.visits ) }
						description={ sprintf(
							/* translators: %s: maximum number of visits */
							__( 'of %s' ),
							formatCompactNumber( plan.visits )
						) }
						progressValue={ visitsPercent }
						progressLabel={ `${ visitsPercent }%` }
						progressColor={ visitsPercent > 80 ? 'alert-yellow' : undefined }
					/>
					<Stat
						density="high"
						strapline={ __( 'Storage used' ) }
						metric={ sprintf(
							/* translators: %d: storage used in GB */
							__( '%dGB' ),
							usage.storageGB
						) }
						description={ sprintf(
							/* translators: %d: maximum storage in GB */
							__( 'of %dGB' ),
							plan.storage
						) }
						progressValue={ storagePercent }
						progressLabel={ `${ storagePercent }%` }
						progressColor={ storagePercent > 80 ? 'alert-yellow' : undefined }
					/>
					<CardDivider />
					<div>
						<Button variant="link" href="https://my.pressable.com" target="_blank" rel="noreferrer">
							{ __( 'Manage in Pressable ↗' ) }
						</Button>
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function PressableContent( {
	planSlug,
	onPlanChange,
	currentPlan,
	usage,
	isReferralMode = false,
	onReferNow,
	onCategoryChange,
	premiumUnlocked = false,
}: {
	planSlug: string;
	onPlanChange: ( slug: string ) => void;
	currentPlan?: PressablePlan;
	usage?: PressableUsage;
	isReferralMode?: boolean;
	onReferNow?: () => void;
	onCategoryChange?: ( category: PlanCategory ) => void;
	// Premium opens in its pitch state every time it is selected; "Refer now"
	// unlocks the plan list for that visit only (Noam, Sept 23).
	premiumUnlocked?: boolean;
} ) {
	const signature = usesSignatureCatalog();
	const [ category, setCategoryState ] = useState< PlanCategory >( () => {
		if ( ! signature ) {
			return 'standard';
		}
		return currentPlan?.category === 'signature-high' ? 'signature-high' : 'signature';
	} );
	const setCategory = ( next: PlanCategory ) => {
		setCategoryState( next );
		onCategoryChange?.( next );
	};

	const categoryPlans = pressablePlans.filter( ( p ) => p.category === category );
	const plan = pressablePlans.find( ( p ) => p.slug === planSlug );
	const isCustomSlug = planSlug === PRESSABLE_CUSTOM_SLUG;
	const showPremiumPitch =
		category === 'premium' &&
		( ! isReferralMode || ! premiumUnlocked ) &&
		premiumTreatment() === 'pitch';
	const referNow = onReferNow ?? ( () => {} );

	const handleCategoryChange = ( next: PlanCategory ) => {
		setCategory( next );
		if ( next === 'custom' ) {
			onPlanChange( PRESSABLE_CUSTOM_SLUG );
			return;
		}
		const first = pressablePlans.find( ( p ) => p.category === next );
		if ( first ) {
			onPlanChange( first.slug );
		}
	};

	return (
		<>
			{ currentPlan && usage && getTitanTreatment() !== 'rail' && (
				<CurrentPlanCard plan={ currentPlan } usage={ usage } />
			) }
			{ currentPlan && usage && getTitanTreatment() === 'card' && (
				<TitanCard orders={ activeTitanOrders( usage ) } />
			) }
			<Card>
				<CardHeader>
					<SectionHeader
						className="marketplace-hosting__card-header"
						level={ 3 }
						title={ currentPlan ? __( 'Upgrade your plan' ) : __( 'Purchase Pressable' ) }
						description={ brandBlurb( 'pressable' ) }
						decoration={ tabLineMark( pressableDescriptor ) }
					/>
				</CardHeader>
				<CardBody>
					<VStack spacing={ 5 }>
						<VStack spacing={ 4 }>
							<VStack spacing={ 3 }>
								<Heading level={ 3 } size={ 13 }>
									{ __( 'Choose a plan type' ) }
								</Heading>
								<OptionCards
									label={ __( 'Plan type' ) }
									options={ signature ? SIGNATURE_TYPE_OPTIONS : PLAN_TYPE_OPTIONS }
									selected={ category }
									onSelect={ ( value ) => handleCategoryChange( value as PlanCategory ) }
								/>
							</VStack>
							{ category !== 'custom' && ! showPremiumPitch && (
								<VStack spacing={ 3 }>
									<Heading level={ 3 } size={ 13 }>
										{ __( 'Select your plan' ) }
									</Heading>
									<SelectControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __( 'Select your plan' ) }
										hideLabelFromVision
										value={ planSlug }
										options={ [
											...categoryPlans.map( ( p ) => ( {
												label:
													p.slug === currentPlan?.slug
														? sprintf(
																/* translators: %s: plan name and specs */
																__( '%s (current plan)' ),
																planOptionLabel( p )
														  )
														: planOptionLabel( p ),
												value: p.slug,
											} ) ),
											// Main and trunk put Custom at the end of the largest tier's
											// list, not as a type of its own.
											...( category === 'signature-high'
												? [
														{
															label: __( 'Custom · more than 500 installs or 10M visits' ),
															value: PRESSABLE_CUSTOM_SLUG,
														},
												  ]
												: [] ),
										] }
										onChange={ onPlanChange }
									/>
								</VStack>
							) }
						</VStack>

						<CardDivider />

						{ showPremiumPitch ? (
							<PremiumPitch onReferNow={ referNow } />
						) : (
							category === 'premium' ? (
								<PremiumSpecs plan={ plan } />
							) : (
								<PlanSpecs category={ category } plan={ plan } isCustom={ isCustomSlug } />
							)
						) }
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
