import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Dropdown,
	ExternalLink,
	Guide,
	Icon,
	Modal,
	TabPanel,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import {
	cart,
	chartBar,
	chevronDown,
	chevronRight,
	chevronUp,
	copy,
	home,
	info,
	lifesaver,
	page,
	shield,
	store,
	tool,
} from '@wordpress/icons';
import { useState } from 'react';
import referralStep1 from 'calypso/assets/images/a8c-for-agencies/referral-step-1.jpg';
import referralStep2 from 'calypso/assets/images/a8c-for-agencies/referral-step-2.jpg';
import referralStep3 from 'calypso/assets/images/a8c-for-agencies/referral-step-3.jpg';
import referralStep4 from 'calypso/assets/images/a8c-for-agencies/referral-step-4.jpg';
import referralStep5 from 'calypso/assets/images/a8c-for-agencies/referral-step-5.jpg';
import { Callout } from '../../../components/callout';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DomainUpsellIllustraction } from '../../../sites/overview-domain-upsell-card/upsell-illustration';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import vipDescriptor from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { CheckGrid, IncludedFeatures, JetpackComplete, Testimonials } from './content-sections';
import demoIllustrationUrl from './demo-callout-illustration.svg';
import {
	hostingBrands,
	formatUSD,
	getTieredPrice,
	mockOwnership,
	pressablePlans,
	wpcomHosting,
} from './mock-data';
import PressableContent from './pressable-content';
import VipContent from './vip-content';
import WpcomConfigurator from './wpcom-configurator';
import YourPlan from './your-plan';
import type { HostingBrand, HostingProduct, TierPrice } from './mock-data';
import type { AgencyProduct } from '@automattic/api-core';
import type { JSX } from 'react';

import './style.scss';

// Hidden while the design is iterated on.
const SHOW_MIGRATION_OFFER = false;

/** Pricing fields present in the API response but not yet declared on AgencyProduct. */
type PricedProduct = AgencyProduct & {
	monthly_price?: number;
	yearly_price?: number;
	tier_monthly_prices?: TierPrice[];
	tier_yearly_prices?: TierPrice[];
};

const REFERRAL_GUIDE_STEPS = [
	{
		title: __( 'Welcome to product referral mode' ),
		description: __(
			'Manage your clients’ products without the burden of managing the billing. Assemble a cart of products, send a request for payment to your clients, and make commissions based on what you sell.'
		),
		media: <img src={ referralStep1 } alt="" width={ 400 } height={ 260 } />,
	},
	{
		title: __( 'Add the products your client needs' ),
		description: __(
			'Ensure “Refer products” is toggled on, and add any mix of products to your cart.'
		),
		media: <img src={ referralStep2 } alt="" width={ 400 } height={ 260 } />,
	},
	{
		title: __( 'Review your selection during checkout' ),
		description: __(
			'During checkout, add your client’s email address and a note about the invoice for the selected products.'
		),
		media: <img src={ referralStep3 } alt="" width={ 400 } height={ 260 } />,
	},
	{
		title: __( 'Send your client the payment request' ),
		description: __(
			'Once sent, your client will get the invoice delivered to their inbox. After they pay, you’ll be able to assign the products to their site.'
		),
		media: <img src={ referralStep4 } alt="" width={ 400 } height={ 260 } />,
	},
	{
		title: __( 'Get paid real commissions' ),
		description: __(
			'Clients will be billed at the end of every month for their products. When they pay, you’ll make commissions on those products, which you’ll be able to manage under the Referrals section, soon.'
		),
		media: <img src={ referralStep5 } alt="" width={ 400 } height={ 260 } />,
	},
];

function ReferralGuide( { onClose }: { onClose: () => void } ) {
	return (
		<Guide
			onFinish={ onClose }
			className="marketplace-hosting__referral-guide"
			contentLabel={ __( 'How referral mode works' ) }
			pages={ REFERRAL_GUIDE_STEPS.map( ( step ) => ( {
				image: step.media,
				content: (
					<VStack spacing={ 2 } className="marketplace-hosting__referral-guide-text">
						<Heading level={ 2 } size={ 16 }>
							{ step.title }
						</Heading>
						<Text as="p" variant="muted">
							{ step.description }
						</Text>
					</VStack>
				),
			} ) ) }
		/>
	);
}

interface CartItem {
	id: string;
	family: 'wpcom-hosting' | 'pressable-hosting';
	label: string;
	total: number | null;
}

const HOSTING_LP_URL = 'https://automattic.com/for-agencies/hosting/';

type GuideChoice = {
	value: string;
	icon: JSX.Element;
	label: string;
	hint: string;
	chip: string;
};

type GuideQuestion = { key: string; prompt: string; choices: GuideChoice[] };

// Three axes the for-agencies hosting LP uses to segment clients: portfolio
// size, the kind of site, and what the client cares about most.
const GUIDE_QUESTIONS: GuideQuestion[] = [
	{
		key: 'scale',
		prompt: __( 'How many sites are you hosting?' ),
		choices: [
			{
				value: 'few',
				icon: home,
				label: __( 'Just one, or a few' ),
				hint: __( 'A small business, nonprofit, or portfolio site.' ),
				chip: __( 'A few sites' ),
			},
			{
				value: 'many',
				icon: copy,
				label: __( 'A whole portfolio' ),
				hint: __( 'You manage many client sites and keep adding more.' ),
				chip: __( 'Portfolio' ),
			},
		],
	},
	{
		key: 'type',
		prompt: __( 'What kind of site is it?' ),
		choices: [
			{
				value: 'content',
				icon: page,
				label: __( 'A content or brochure site' ),
				hint: __( 'Marketing sites, blogs, and portfolios.' ),
				chip: __( 'Content site' ),
			},
			{
				value: 'store',
				icon: store,
				label: __( 'An online store' ),
				hint: __( 'WooCommerce and other transactional sites.' ),
				chip: __( 'Online store' ),
			},
			{
				value: 'app',
				icon: tool,
				label: __( 'A custom or high-scale build' ),
				hint: __( 'Complex, high-traffic, or headless projects.' ),
				chip: __( 'Custom build' ),
			},
		],
	},
	{
		key: 'priority',
		prompt: __( 'What matters most to this client?' ),
		choices: [
			{
				value: 'simple',
				icon: lifesaver,
				label: __( 'Simplicity and low upkeep' ),
				hint: __( 'Secure and reliable with minimal management.' ),
				chip: __( 'Low upkeep' ),
			},
			{
				value: 'performance',
				icon: chartBar,
				label: __( 'Performance and margin' ),
				hint: __( 'Fast sites and healthy margins as you grow.' ),
				chip: __( 'Performance' ),
			},
			{
				value: 'compliance',
				icon: shield,
				label: __( 'Security and compliance' ),
				hint: __( 'Enterprise-grade security for high-stakes sites.' ),
				chip: __( 'Compliance' ),
			},
		],
	},
];

// Recommendation copy mirrors the for-agencies hosting LP’s segment descriptions.
const RECOMMENDATIONS: Record<
	HostingBrand[ 'key' ],
	{ logo: string; outcome: string; proof: string[] }
> = {
	wpcom: {
		logo: wpcomDescriptor,
		outcome: __(
			'A secure site with better performance and minimal upkeep, with managed essentials like Jetpack and Akismet built in.'
		),
		proof: [
			__( 'Staging, backups & CDN' ),
			__( 'Reliable uptime' ),
			__( 'Free migrations' ),
			__( 'Per-site pricing' ),
		],
	},
	pressable: {
		logo: pressableDescriptor,
		outcome: __(
			'Flexibility, speed, and room to scale, with free migrations and global caching, at pricing that keeps your margins healthy.'
		),
		proof: [
			__( 'Pooled traffic & storage' ),
			__( 'Free migrations' ),
			__( 'Global caching' ),
			__( 'Healthy margins' ),
		],
	},
	vip: {
		logo: vipDescriptor,
		outcome: __(
			'Unmatched speeds, dedicated support, and enterprise-grade security and compliance for high-scale, high-stakes sites.'
		),
		proof: [
			__( 'Enterprise security' ),
			__( 'Dedicated support' ),
			__( 'Compliance-ready' ),
			__( 'Guided onboarding' ),
		],
	},
};

function recommendBrand( answers: Record< string, string > ): HostingBrand[ 'key' ] {
	const { scale, type, priority } = answers;
	if ( priority === 'compliance' || type === 'app' ) {
		return 'vip';
	}
	if ( scale === 'many' || type === 'store' || priority === 'performance' ) {
		return 'pressable';
	}
	return 'wpcom';
}

function GuideChoiceList( {
	choices,
	onPick,
}: {
	choices: GuideChoice[];
	onPick: ( value: string ) => void;
} ) {
	return (
		<VStack spacing={ 3 } role="group">
			{ choices.map( ( choice ) => (
				<Card
					key={ choice.value }
					className="marketplace-hosting__guide-option"
					onClick={ () => onPick( choice.value ) }
					role="button"
					tabIndex={ 0 }
					onKeyDown={ ( event: React.KeyboardEvent ) => {
						if ( event.key === 'Enter' || event.key === ' ' ) {
							event.preventDefault();
							onPick( choice.value );
						}
					} }
				>
					<CardBody>
						<HStack spacing={ 4 } alignment="center" justify="flex-start">
							<div className="marketplace-hosting__guide-icon">
								<Icon icon={ choice.icon } />
							</div>
							<VStack spacing={ 0 } expanded>
								<Text weight={ 600 }>{ choice.label }</Text>
								<Text variant="muted">{ choice.hint }</Text>
							</VStack>
							<Icon icon={ chevronRight } className="marketplace-hosting__guide-chevron" />
						</HStack>
					</CardBody>
				</Card>
			) ) }
		</VStack>
	);
}

function HostingGuide( {
	onSelect,
	onClose,
}: {
	onSelect: ( brand: HostingBrand[ 'key' ] ) => void;
	onClose: () => void;
} ) {
	const total = GUIDE_QUESTIONS.length;
	const [ step, setStep ] = useState( 0 );
	const [ answers, setAnswers ] = useState< Record< string, string > >( {} );

	const isResult = step >= total;
	const complete = GUIDE_QUESTIONS.every( ( q ) => answers[ q.key ] );
	const recommendedKey = isResult && complete ? recommendBrand( answers ) : null;
	const recommendation = recommendedKey ? RECOMMENDATIONS[ recommendedKey ] : null;
	const brand = recommendedKey ? hostingBrands.find( ( b ) => b.key === recommendedKey ) : null;
	const question = isResult ? null : GUIDE_QUESTIONS[ step ];

	const recap = GUIDE_QUESTIONS.map(
		( q ) => q.choices.find( ( c ) => c.value === answers[ q.key ] )?.chip
	).filter( Boolean ) as string[];

	const pick = ( key: string, value: string ) => {
		setAnswers( ( current ) => ( { ...current, [ key ]: value } ) );
		setStep( ( current ) => current + 1 );
	};
	const restart = () => {
		setAnswers( {} );
		setStep( 0 );
	};

	return (
		<Modal
			title={ __( 'Find the right hosting' ) }
			onRequestClose={ onClose }
			size="medium"
			className="marketplace-hosting__guide-modal"
		>
			<VStack spacing={ 5 }>
				<div className="marketplace-hosting__guide-steps" aria-hidden>
					{ GUIDE_QUESTIONS.map( ( q, index ) => (
						<span
							key={ q.key }
							className={
								'marketplace-hosting__guide-step' + ( index <= step ? ' is-active' : '' )
							}
						/>
					) ) }
				</div>

				{ question && (
					<>
						<VStack spacing={ 2 }>
							<Text size={ 11 } weight={ 600 } variant="muted" upperCase>
								{ sprintf(
									/* translators: %1$d: current step, %2$d: total steps */
									__( 'Step %1$d of %2$d' ),
									step + 1,
									total
								) }
							</Text>
							<Heading level={ 2 } size={ 20 }>
								{ question.prompt }
							</Heading>
						</VStack>
						<GuideChoiceList
							choices={ question.choices }
							onPick={ ( value ) => pick( question.key, value ) }
						/>
						<HStack justify="space-between">
							{ step > 0 ? (
								<Button variant="tertiary" onClick={ () => setStep( step - 1 ) }>
									{ __( '← Back' ) }
								</Button>
							) : (
								<span />
							) }
							<ExternalLink href={ HOSTING_LP_URL }>{ __( 'Or compare all plans' ) }</ExternalLink>
						</HStack>
					</>
				) }

				{ isResult && recommendation && brand && (
					<VStack spacing={ 4 }>
						<Text size={ 11 } weight={ 600 } variant="muted" upperCase>
							{ __( 'Here’s what we recommend' ) }
						</Text>
						<Card className="marketplace-hosting__guide-result">
							<CardBody>
								<VStack spacing={ 4 }>
									<VStack spacing={ 2 } alignment="flex-start">
										<Text size={ 12 } weight={ 600 } variant="muted" upperCase>
											{ __( 'Top pick' ) }
										</Text>
										<img
											src={ recommendation.logo }
											alt={ brand.name }
											className="marketplace-hosting__guide-logo"
										/>
									</VStack>
									<Text variant="muted">{ recommendation.outcome }</Text>
									<CheckGrid items={ recommendation.proof } />
								</VStack>
							</CardBody>
						</Card>
						{ recap.length > 0 && (
							<VStack spacing={ 2 }>
								<Text size={ 11 } weight={ 600 } variant="muted" upperCase>
									{ __( 'Based on your answers' ) }
								</Text>
								<div className="marketplace-hosting__guide-recap">
									{ recap.map( ( chip ) => (
										<span key={ chip } className="marketplace-hosting__guide-chip">
											{ chip }
										</span>
									) ) }
								</div>
							</VStack>
						) }
						<HStack justify="space-between">
							<Button variant="tertiary" onClick={ restart }>
								{ __( 'Start over' ) }
							</Button>
							<Button
								variant="primary"
								__next40pxDefaultSize
								onClick={ () => onSelect( brand.key ) }
							>
								{ sprintf(
									/* translators: %s: hosting brand name */
									__( 'Configure %s' ),
									brand.name
								) }
							</Button>
						</HStack>
					</VStack>
				) }
			</VStack>
		</Modal>
	);
}

function MigrationOffer() {
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 3 }>
					<HStack justify="space-between" alignment="center">
						<Text weight={ 600 }>
							{ __(
								'Limited time offer: Migrate your sites to Pressable or WordPress.com and earn up to $10,000!'
							) }
						</Text>
						<Button
							icon={ isExpanded ? chevronUp : chevronDown }
							label={ isExpanded ? __( 'Collapse offer details' ) : __( 'Expand offer details' ) }
							onClick={ () => setIsExpanded( ! isExpanded ) }
						/>
					</HStack>
					{ isExpanded && (
						<Text as="p" variant="muted">
							{ __(
								'Migrate your clients’ sites to WordPress.com or Pressable hosting and earn up to $10,000 in migration commissions. Payouts are made after 60 days of hosting with us.'
							) }
						</Text>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

function DevSitesBanner() {
	return (
		<Callout
			title={ __( 'Not ready to launch yet? Start building for free' ) }
			titleAs="h2"
			description={
				<Text variant="muted">
					{ __(
						'Create up to 5 WordPress.com development sites and only pay when you launch. 5 of 5 available.'
					) }
				</Text>
			}
			image={
				<DomainUpsellIllustraction
					title={ __( 'Development site' ) }
					domain="yourclient.wpcomstaging.com"
					search="yourclient"
				/>
			}
			imageVariant="full-bleed"
			actions={
				<Button variant="secondary" size="compact">
					{ __( 'Create a development site' ) }
				</Button>
			}
		/>
	);
}

function ScheduleDemoBanner() {
	return (
		<Callout
			title={ __( 'Want a guided tour? Schedule a demo' ) }
			titleAs="h2"
			description={
				<Text variant="muted">
					{ __(
						'Our experts are happy to give you a one-on-one tour of our platform and the free perks that come with Pressable.'
					) }
				</Text>
			}
			image={ demoIllustrationUrl }
			imageAlt={ __( 'Responsive website design' ) }
			imageVariant="full-bleed"
			actions={
				<Button
					variant="secondary"
					size="compact"
					href="https://pressable.com/request-demo"
					target="_blank"
					rel="noreferrer"
				>
					{ __( 'Schedule a demo ↗' ) }
				</Button>
			}
		/>
	);
}

function CartDropdown( {
	items,
	onRemove,
	open,
	onToggle,
}: {
	items: CartItem[];
	onRemove: ( id: string ) => void;
	open: boolean;
	onToggle: ( willOpen: boolean ) => void;
} ) {
	const total = items.reduce( ( sum, item ) => sum + ( item.total ?? 0 ), 0 );

	return (
		<Dropdown
			open={ open }
			onToggle={ onToggle }
			popoverProps={ { placement: 'bottom-end' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ cart }
					label={ __( 'Shopping cart' ) }
					aria-expanded={ isOpen }
					onClick={ onToggle }
					text={ items.length > 0 ? String( items.length ) : undefined }
				/>
			) }
			renderContent={ () => (
				<VStack spacing={ 3 } className="marketplace-hosting__cart">
					<Heading level={ 3 } size={ 13 }>
						{ __( 'Cart' ) }
					</Heading>
					{ items.length === 0 && <Text variant="muted">{ __( 'Your cart is empty.' ) }</Text> }
					{ items.map( ( item ) => (
						<HStack key={ item.id } justify="space-between" spacing={ 4 }>
							<Text>{ item.label }</Text>
							<HStack spacing={ 3 } justify="flex-end" expanded={ false }>
								<Text>{ item.total !== null ? formatUSD( item.total ) : '—' }</Text>
								<Button variant="link" isDestructive onClick={ () => onRemove( item.id ) }>
									{ __( 'Remove' ) }
								</Button>
							</HStack>
						</HStack>
					) ) }
					{ items.length > 0 && (
						<>
							<HStack justify="space-between">
								<Text weight={ 600 }>{ __( 'Total per year' ) }</Text>
								<Text weight={ 600 }>{ formatUSD( total ) }</Text>
							</HStack>
							<Button variant="primary" __next40pxDefaultSize>
								{ __( 'Proceed to checkout' ) }
							</Button>
						</>
					) }
				</VStack>
			) }
		/>
	);
}

export default function MarketplaceHosting() {
	// Prototype-only: `?tab` and `?existing` make every demo state linkable.
	const [ selectedBrand, setSelectedBrand ] = useState< HostingBrand[ 'key' ] >( () => {
		const tab = new URLSearchParams( window.location.search ).get( 'tab' );
		return tab === 'pressable' || tab === 'vip' ? tab : 'wpcom';
	} );
	const [ term, setTerm ] = useState< 'monthly' | 'yearly' >( 'yearly' );
	const [ isReferralMode, setIsReferralMode ] = useState( false );
	const [ isGuideOpen, setIsGuideOpen ] = useState( false );
	const [ hasSeenGuide, setHasSeenGuide ] = useState( false );

	const handleReferralToggle = ( checked: boolean ) => {
		setIsReferralMode( checked );
		if ( checked && ! hasSeenGuide ) {
			setHasSeenGuide( true );
			setIsGuideOpen( true );
		}
	};
	const [ quantity, setQuantity ] = useState( 3 );
	const [ pressablePlanSlug, setPressablePlanSlug ] = useState( () => {
		if ( ! new URLSearchParams( window.location.search ).has( 'existing' ) ) {
			return 'pressable-signature-1';
		}
		const currentIndex = pressablePlans.findIndex(
			( p ) => p.slug === mockOwnership.pressable.planSlug
		);
		return pressablePlans[ currentIndex + 1 ]?.slug ?? mockOwnership.pressable.planSlug;
	} );

	// Prototype-only: `?alt` shows the alternative controls suggested in the i1
	// feedback — a plain quantity input instead of presets, and a segmented
	// Purchase/Refer switch instead of the toggle.
	const [ useAltControls ] = useState( () =>
		new URLSearchParams( window.location.search ).has( 'alt' )
	);

	const [ isChooserOpen, setIsChooserOpen ] = useState( false );

	// Prototype-only: `?existing` simulates returning-customer data that will
	// come from license and usage queries ( see mockOwnership ).
	const isExistingCustomer = new URLSearchParams( window.location.search ).has( 'existing' );
	const ownedSites = isExistingCustomer ? mockOwnership.wpcom.ownedSites : 0;
	const pressableCurrentPlan = isExistingCustomer
		? pressablePlans.find( ( p ) => p.slug === mockOwnership.pressable.planSlug )
		: undefined;
	const pressableUsage = isExistingCustomer ? mockOwnership.pressable.usage : undefined;

	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: apiProducts } = useQuery( agencyProductsQuery( agency?.id ?? 0 ) );
	const products = apiProducts as PricedProduct[] | undefined;

	const wpcomApi = products?.find( ( p ) => p.family_slug === 'wpcom-hosting' );
	const wpcomProduct: HostingProduct = wpcomApi
		? {
				...wpcomHosting,
				monthly_price: wpcomApi.monthly_price ?? wpcomHosting.monthly_price,
				yearly_price: wpcomApi.yearly_price ?? wpcomHosting.yearly_price,
				tier_monthly_prices: wpcomApi.tier_monthly_prices ?? wpcomHosting.tier_monthly_prices,
				tier_yearly_prices: wpcomApi.tier_yearly_prices ?? wpcomHosting.tier_yearly_prices,
		  }
		: wpcomHosting;

	const pressableApi = products?.find( ( p ) => p.slug === pressablePlanSlug );
	const pressablePlanData = pressablePlans.find( ( p ) => p.slug === pressablePlanSlug );
	const pressablePlan = pressablePlanData
		? {
				...pressablePlanData,
				yearly_price: pressableApi?.yearly_price ?? pressablePlanData.yearly_price,
				monthly_price: pressableApi?.monthly_price ?? pressablePlanData.monthly_price,
		  }
		: undefined;
	const [ cartItems, setCartItems ] = useState< CartItem[] >( [] );
	const [ isCartOpen, setIsCartOpen ] = useState( false );

	const addToCart = ( item: CartItem ) => {
		setCartItems( ( current ) => [
			...current.filter( ( existing ) => existing.family !== item.family ),
			item,
		] );
		setIsCartOpen( true );
	};

	const removeFromCart = ( id: string ) => {
		setCartItems( ( current ) => current.filter( ( item ) => item.id !== id ) );
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Hosting' ) }
					description={
						<>
							{ __(
								'Choose the right hosting for each client, from single sites to enterprise platforms.'
							) }{ ' ' }
							<Button
								variant="link"
								onClick={ () => setIsChooserOpen( ( open ) => ! open ) }
								aria-expanded={ isChooserOpen }
							>
								{ __( 'Not sure which fits?' ) }
							</Button>
						</>
					}
					actions={
						<div className="marketplace-hosting__header-actions">
							<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
								<Text variant="muted">{ __( 'Billed:' ) }</Text>
								<Text variant={ term === 'monthly' ? undefined : 'muted' }>
									{ __( 'Monthly' ) }
								</Text>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ term === 'yearly' }
									label={ __( 'Yearly' ) }
									onChange={ ( checked ) => setTerm( checked ? 'yearly' : 'monthly' ) }
								/>
							</HStack>
							<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
								{ useAltControls ? (
									<ToggleGroupControl
										__nextHasNoMarginBottom
										hideLabelFromVision
										isAdaptiveWidth
										label={ __( 'Marketplace mode' ) }
										value={ isReferralMode ? 'refer' : 'purchase' }
										onChange={ ( value ) => handleReferralToggle( value === 'refer' ) }
									>
										<ToggleGroupControlOption value="purchase" label={ __( 'Purchase' ) } />
										<ToggleGroupControlOption value="refer" label={ __( 'Refer' ) } />
									</ToggleGroupControl>
								) : (
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ isReferralMode }
										label={ __( 'Refer products' ) }
										onChange={ handleReferralToggle }
									/>
								) }
								<Button
									icon={ info }
									size="small"
									label={ __( 'Learn how referral mode works' ) }
									onClick={ () => setIsGuideOpen( true ) }
								/>
							</HStack>
							<CartDropdown
								items={ cartItems }
								onRemove={ removeFromCart }
								open={ isCartOpen }
								onToggle={ setIsCartOpen }
							/>
						</div>
					}
				/>
			}
		>
			{ isGuideOpen && <ReferralGuide onClose={ () => setIsGuideOpen( false ) } /> }
			{ SHOW_MIGRATION_OFFER && <MigrationOffer /> }
			{ isChooserOpen && (
				<HostingGuide
					onSelect={ ( brand ) => {
						setSelectedBrand( brand );
						setIsChooserOpen( false );
					} }
					onClose={ () => setIsChooserOpen( false ) }
				/>
			) }
			<TabPanel
				key={ selectedBrand }
				className="marketplace-hosting__tabs"
				tabs={ hostingBrands.map( ( brand ) => ( { name: brand.key, title: brand.name } ) ) }
				initialTabName={ selectedBrand }
				onSelect={ ( tabName ) => setSelectedBrand( tabName as HostingBrand[ 'key' ] ) }
			>
				{ () => null }
			</TabPanel>
			{ selectedBrand === 'wpcom' && (
				<div className="marketplace-hosting__layout">
					<VStack spacing={ 8 } justify="flex-start">
						<VStack spacing={ 4 }>
							<WpcomConfigurator
								product={ wpcomProduct }
								term={ term }
								onQuantityChange={ setQuantity }
								ownedSites={ ownedSites }
								altQuantityControl={ useAltControls }
							/>
							<DevSitesBanner />
						</VStack>
						<Divider
							orientation="horizontal"
							style={ { color: 'var(--dashboard-overview__divider-color)' } }
						/>
						<IncludedFeatures brand="wpcom" />
						<Testimonials brand="wpcom" />
					</VStack>
					<div className="marketplace-hosting__rail">
						<YourPlan
							brand="wpcom"
							product={ wpcomProduct }
							term={ term }
							quantity={ quantity }
							ownedSites={ ownedSites }
							onAddToCart={ () =>
								addToCart( {
									id: 'wpcom-hosting',
									family: 'wpcom-hosting',
									label: sprintf(
										/* translators: %d: number of sites */
										_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
										quantity
									),
									total: getTieredPrice( wpcomProduct, quantity, term, ownedSites ).discountedCost,
								} )
							}
						/>
					</div>
				</div>
			) }
			{ selectedBrand === 'pressable' && (
				<div className="marketplace-hosting__layout">
					<VStack spacing={ 8 } justify="flex-start">
						<VStack spacing={ 4 }>
							<PressableContent
								planSlug={ pressablePlanSlug }
								onPlanChange={ setPressablePlanSlug }
								currentPlan={ pressableCurrentPlan }
								usage={ pressableUsage }
							/>
							<ScheduleDemoBanner />
						</VStack>
						<Divider
							orientation="horizontal"
							style={ { color: 'var(--dashboard-overview__divider-color)' } }
						/>
						<IncludedFeatures brand="pressable" />
						<JetpackComplete />
						<Testimonials brand="pressable" />
					</VStack>
					<div className="marketplace-hosting__rail">
						<YourPlan
							brand="pressable"
							term={ term }
							quantity={ 1 }
							plan={ pressablePlan }
							currentPlan={ pressableCurrentPlan }
							onAddToCart={ () =>
								addToCart( {
									id: 'pressable-hosting',
									family: 'pressable-hosting',
									label: sprintf(
										/* translators: %s: plan name */
										__( 'Pressable %s' ),
										pressablePlan?.name ?? ''
									),
									total:
										( term === 'yearly'
											? pressablePlan?.yearly_price
											: pressablePlan?.monthly_price ) ?? null,
								} )
							}
						/>
					</div>
				</div>
			) }
			{ selectedBrand === 'vip' && <VipContent /> }
		</PageLayout>
	);
}
