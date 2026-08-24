import {
	Button,
	Dropdown,
	Guide,
	ToggleControl,
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { cart, chevronDown, chevronUp, info } from '@wordpress/icons';
import { useState } from 'react';
import referralStep1 from 'calypso/assets/images/a8c-for-agencies/referral-step-1.jpg';
import referralStep2 from 'calypso/assets/images/a8c-for-agencies/referral-step-2.jpg';
import referralStep3 from 'calypso/assets/images/a8c-for-agencies/referral-step-3.jpg';
import referralStep4 from 'calypso/assets/images/a8c-for-agencies/referral-step-4.jpg';
import referralStep5 from 'calypso/assets/images/a8c-for-agencies/referral-step-5.jpg';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { IncludedFeatures, JetpackComplete, Testimonials } from './content-sections';
import {
	hostingBrands,
	formatUSD,
	getTieredPrice,
	pressableSignaturePlans,
	wpcomHosting,
} from './mock-data';
import PressableContent from './pressable-content';
import ProductSelector from './product-selector';
import VipContent from './vip-content';
import WpcomConfigurator from './wpcom-configurator';
import YourPlan from './your-plan';
import type { HostingBrand } from './mock-data';

import './style.scss';

// Hidden while the design is iterated on.
const SHOW_MIGRATION_OFFER = false;

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
		<Card>
			<CardBody>
				<HStack justify="space-between" alignment="center" spacing={ 6 }>
					<VStack spacing={ 1 }>
						<Text weight={ 600 }>{ __( 'Not ready to launch yet? Start building for free' ) }</Text>
						<Text variant="muted">
							{ __(
								'Create up to 5 WordPress.com development sites and only pay when you launch. 5 of 5 available.'
							) }
						</Text>
					</VStack>
					<Button variant="secondary" __next40pxDefaultSize>
						{ __( 'Create a development site' ) }
					</Button>
				</HStack>
			</CardBody>
		</Card>
	);
}

function ScheduleDemoBanner() {
	return (
		<Card>
			<CardBody>
				<HStack justify="space-between" alignment="center" spacing={ 6 }>
					<VStack spacing={ 1 }>
						<Text weight={ 600 }>{ __( 'Want a guided tour? Schedule a demo' ) }</Text>
						<Text variant="muted">
							{ __(
								'Our experts are happy to give you a one-on-one tour of our platform and the free perks that come with Pressable.'
							) }
						</Text>
					</VStack>
					<Button
						variant="secondary"
						__next40pxDefaultSize
						href="https://pressable.com/request-demo"
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'Schedule a demo ↗' ) }
					</Button>
				</HStack>
			</CardBody>
		</Card>
	);
}

function CartDropdown( {
	items,
	onRemove,
}: {
	items: CartItem[];
	onRemove: ( id: string ) => void;
} ) {
	const total = items.reduce( ( sum, item ) => sum + ( item.total ?? 0 ), 0 );

	return (
		<Dropdown
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
	const [ selectedBrand, setSelectedBrand ] = useState< HostingBrand[ 'key' ] >( 'wpcom' );
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
	const [ pressablePlanSlug, setPressablePlanSlug ] = useState( 'pressable-signature-1' );

	const pressablePlan =
		pressableSignaturePlans.find( ( p ) => p.slug === pressablePlanSlug ) ??
		pressableSignaturePlans[ 0 ];
	const [ cartItems, setCartItems ] = useState< CartItem[] >( [] );

	const addToCart = ( item: CartItem ) => {
		setCartItems( ( current ) => [
			...current.filter( ( existing ) => existing.family !== item.family ),
			item,
		] );
	};

	const removeFromCart = ( id: string ) => {
		setCartItems( ( current ) => current.filter( ( item ) => item.id !== id ) );
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Hosting' ) }
					description={ __(
						'High performance, highly secure managed WordPress hosting for your clients.'
					) }
					actions={
						<HStack spacing={ 4 } justify="flex-end">
							<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
								<Text variant="muted">{ __( 'Billed:' ) }</Text>
								<Text variant={ term === 'monthly' ? undefined : 'muted' }>
									{ __( 'Monthly' ) }
								</Text>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ term === 'yearly' }
									label={ undefined }
									onChange={ ( checked ) => setTerm( checked ? 'yearly' : 'monthly' ) }
								/>
								<Text variant={ term === 'yearly' ? undefined : 'muted' }>{ __( 'Yearly' ) }</Text>
							</HStack>
							<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ isReferralMode }
									label={ __( 'Refer products' ) }
									onChange={ handleReferralToggle }
								/>
								<Button
									icon={ info }
									size="small"
									label={ __( 'Learn how referral mode works' ) }
									onClick={ () => setIsGuideOpen( true ) }
								/>
							</HStack>
							<CartDropdown items={ cartItems } onRemove={ removeFromCart } />
						</HStack>
					}
				/>
			}
		>
			{ isGuideOpen && <ReferralGuide onClose={ () => setIsGuideOpen( false ) } /> }
			{ SHOW_MIGRATION_OFFER && <MigrationOffer /> }
			<VStack spacing={ 4 }>
				<SectionHeader title={ __( 'Choose a hosting platform' ) } level={ 2 } />
				<ProductSelector
					brands={ hostingBrands }
					selected={ selectedBrand }
					onSelect={ setSelectedBrand }
				/>
			</VStack>
			{ selectedBrand === 'wpcom' && (
				<VStack spacing={ 6 }>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Configure WordPress.com' ) } level={ 2 } />
						<div className="marketplace-hosting__configurator-row">
							<WpcomConfigurator term={ term } onQuantityChange={ setQuantity } />
							<YourPlan
								brand="wpcom"
								term={ term }
								quantity={ quantity }
								onAddToCart={ () =>
									addToCart( {
										id: 'wpcom-hosting',
										family: 'wpcom-hosting',
										label: sprintf(
											/* translators: %d: number of sites */
											_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
											quantity
										),
										total: getTieredPrice( wpcomHosting, quantity, term ).discountedCost,
									} )
								}
							/>
						</div>
					</VStack>
					<DevSitesBanner />
				</VStack>
			) }
			{ selectedBrand === 'pressable' && (
				<VStack spacing={ 6 }>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Configure Pressable' ) } level={ 2 } />
						<div className="marketplace-hosting__configurator-row">
							<PressableContent
								planSlug={ pressablePlanSlug }
								onPlanChange={ setPressablePlanSlug }
							/>
							<YourPlan
								brand="pressable"
								term={ term }
								quantity={ 1 }
								plan={ pressablePlan }
								onAddToCart={ () =>
									addToCart( {
										id: 'pressable-hosting',
										family: 'pressable-hosting',
										label: sprintf(
											/* translators: %s: plan name */
											__( 'Pressable %s' ),
											pressablePlan.name
										),
										total: pressablePlan.yearly_price ?? null,
									} )
								}
							/>
						</div>
					</VStack>
					<ScheduleDemoBanner />
				</VStack>
			) }
			{ selectedBrand === 'vip' && <VipContent /> }
			<Divider
				orientation="horizontal"
				style={ { color: 'var(--dashboard-overview__divider-color)' } }
			/>
			{ selectedBrand === 'wpcom' && (
				<VStack spacing={ 8 }>
					<IncludedFeatures brand="wpcom" />
					<Testimonials brand="wpcom" />
				</VStack>
			) }
			{ selectedBrand === 'pressable' && (
				<VStack spacing={ 8 }>
					<IncludedFeatures brand="pressable" />
					<JetpackComplete />
					<Testimonials brand="pressable" />
				</VStack>
			) }
			{ selectedBrand === 'vip' && <Testimonials brand="vip" /> }
		</PageLayout>
	);
}
