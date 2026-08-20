import {
	Button,
	Dropdown,
	ExternalLink,
	Guide,
	ToggleControl,
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
import {
	ClientRelationships,
	CheckList,
	IncludedFeatures,
	JetpackComplete,
	Testimonials,
} from './content-sections';
import { hostingBrands, formatUSD } from './mock-data';
import PressableContent from './pressable-content';
import ProductSelector from './product-selector';
import VipContent from './vip-content';
import WpcomConfigurator from './wpcom-configurator';
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
		media: <img src={ referralStep1 } alt="" />,
	},
	{
		title: __( 'Add the products your client needs' ),
		description: __(
			'Ensure “Refer products” is toggled on, and add any mix of products to your cart.'
		),
		media: (
			<video
				src="https://automattic.com/wp-content/uploads/2024/05/referral-step-2.mp4"
				preload="auto"
				width={ 400 }
				poster={ referralStep2 }
				muted
				autoPlay
			/>
		),
	},
	{
		title: __( 'Review your selection during checkout' ),
		description: __(
			'During checkout, add your client’s email address and a note about the invoice for the selected products.'
		),
		media: (
			<video
				src="https://automattic.com/wp-content/uploads/2024/05/referral-step-3.mp4"
				preload="auto"
				width={ 400 }
				poster={ referralStep3 }
				muted
				autoPlay
			/>
		),
	},
	{
		title: __( 'Send your client the payment request' ),
		description: __(
			'Once sent, your client will get the invoice delivered to their inbox. After they pay, you’ll be able to assign the products to their site.'
		),
		media: (
			<video
				src="https://automattic.com/wp-content/uploads/2024/05/referral-step-4.mp4"
				preload="auto"
				width={ 400 }
				poster={ referralStep4 }
				muted
				autoPlay
			/>
		),
	},
	{
		title: __( 'Get paid real commissions' ),
		description: __(
			'Clients will be billed at the end of every month for their products. When they pay, you’ll make commissions on those products, which you’ll be able to manage under the Referrals section, soon.'
		),
		media: <img src={ referralStep5 } alt="" />,
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
					<VStack spacing={ 2 }>
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

function FreeDevSites() {
	return (
		<Card className="marketplace-hosting__dev-sites">
			<CardBody>
				<VStack spacing={ 3 }>
					<Heading level={ 3 } size={ 16 }>
						{ __( 'Start building for free' ) }
					</Heading>
					<Text as="p" variant="muted">
						{ __(
							'Included in your membership to Automattic for Agencies. Develop up to 5 WordPress.com sites with free development licenses. Only pay when you launch.'
						) }
					</Text>
					<Text variant="muted" size={ 12 }>
						{ __( '5 of 5 free licenses available' ) }
					</Text>
					<HStack justify="flex-start">
						<Button variant="secondary" __next40pxDefaultSize>
							{ __( 'Create a development site' ) }
						</Button>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

function ScheduleDemo() {
	return (
		<Card className="marketplace-hosting__dev-sites">
			<CardBody>
				<VStack spacing={ 3 }>
					<Heading level={ 3 } size={ 16 }>
						{ __( 'Schedule a demo' ) }
					</Heading>
					<Text as="p" variant="muted">
						{ __(
							'Our experts are happy to give you a one-on-one tour of our platform to discuss:'
						) }
					</Text>
					<CheckList
						items={ [
							__( 'Our support, service, and pricing flexibility' ),
							__( 'The best hosting plan for your needs' ),
							__( 'How to launch and manage WordPress sites' ),
							__( 'The free perks that come with Pressable' ),
						] }
					/>
					<ExternalLink href="https://pressable.com/request-demo">
						{ __( 'Schedule a demo' ) }
					</ExternalLink>
				</VStack>
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

function MoreAboutHosting( {
	brandName,
	children,
}: {
	brandName: string;
	children: React.ReactNode;
} ) {
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<HStack justify="space-between" alignment="center">
						<Text weight={ 600 }>
							{ sprintf(
								/* translators: %s: hosting brand name */
								__( 'More about %s hosting: features, Jetpack, and what agencies say' ),
								brandName
							) }
						</Text>
						<Button
							icon={ isExpanded ? chevronUp : chevronDown }
							label={ isExpanded ? __( 'Collapse details' ) : __( 'Expand details' ) }
							onClick={ () => setIsExpanded( ! isExpanded ) }
						/>
					</HStack>
				</CardBody>
			</Card>
			{ isExpanded && children }
		</VStack>
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
	const [ pressablePlanSlug, setPressablePlanSlug ] = useState( 'pressable-signature-1' );
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
								<span className="marketplace-hosting__term-toggle">
									<ToggleControl
										__nextHasNoMarginBottom
										checked={ term === 'yearly' }
										label={ __( 'Bill yearly' ) }
										onChange={ ( checked ) => setTerm( checked ? 'yearly' : 'monthly' ) }
									/>
								</span>
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
				<div className="marketplace-hosting__configurator-row">
					<WpcomConfigurator
						term={ term }
						onAddToCart={ ( quantity, total ) =>
							addToCart( {
								id: 'wpcom-hosting',
								family: 'wpcom-hosting',
								label: sprintf(
									/* translators: %d: number of sites */
									_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
									quantity
								),
								total,
							} )
						}
					/>
					<FreeDevSites />
				</div>
			) }
			{ selectedBrand === 'pressable' && (
				<div className="marketplace-hosting__configurator-row">
					<PressableContent
						planSlug={ pressablePlanSlug }
						onPlanChange={ setPressablePlanSlug }
						onAddToCart={ ( planName, total ) =>
							addToCart( {
								id: 'pressable-hosting',
								family: 'pressable-hosting',
								label: sprintf(
									/* translators: %s: plan name */
									__( 'Pressable %s' ),
									planName
								),
								total,
							} )
						}
					/>
					<ScheduleDemo />
				</div>
			) }
			{ selectedBrand === 'vip' && <VipContent /> }
			{ selectedBrand === 'wpcom' && (
				<MoreAboutHosting brandName="WordPress.com">
					<VStack spacing={ 6 }>
						<IncludedFeatures brand="wpcom" />
						<Testimonials brand="wpcom" />
						<ClientRelationships />
					</VStack>
				</MoreAboutHosting>
			) }
			{ selectedBrand === 'pressable' && (
				<MoreAboutHosting brandName="Pressable">
					<VStack spacing={ 6 }>
						<IncludedFeatures brand="pressable" />
						<JetpackComplete />
						<Testimonials brand="pressable" />
						<ClientRelationships />
					</VStack>
				</MoreAboutHosting>
			) }
			{ selectedBrand === 'vip' && (
				<MoreAboutHosting brandName="WordPress VIP">
					<Testimonials brand="vip" />
				</MoreAboutHosting>
			) }
		</PageLayout>
	);
}
