import {
	Button,
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import {
	ClientRelationships,
	IncludedFeatures,
	JetpackComplete,
	Testimonials,
} from './content-sections';
import { hostingBrands, pressableSignaturePlans } from './mock-data';
import OrderSummary from './order-summary';
import PressableContent from './pressable-content';
import ProductSelector from './product-selector';
import VipContent from './vip-content';
import WpcomConfigurator from './wpcom-configurator';
import type { HostingBrand } from './mock-data';

import './style.scss';

// Hidden while the design is iterated on.
const SHOW_MIGRATION_OFFER = false;

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
	const [ quantity, setQuantity ] = useState( 3 );
	const [ pressablePlanSlug, setPressablePlanSlug ] = useState( 'pressable-signature-1' );
	const [ cartCount, setCartCount ] = useState( 0 );

	const pressablePlan =
		pressableSignaturePlans.find( ( p ) => p.slug === pressablePlanSlug ) ??
		pressableSignaturePlans[ 0 ];

	const handleCheckout = () => {
		setCartCount( selectedBrand === 'wpcom' ? quantity : 1 );
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
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ isReferralMode }
								label={ __( 'Refer products' ) }
								onChange={ setIsReferralMode }
							/>
							{ cartCount > 0 && (
								<Text weight={ 600 }>
									{ sprintf(
										/* translators: %d: number of items in the cart */
										_n( 'Cart: %d item', 'Cart: %d items', cartCount ),
										cartCount
									) }
								</Text>
							) }
						</HStack>
					}
				/>
			}
		>
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
				<VStack spacing={ 4 }>
					<div className="marketplace-hosting__configurator-row">
						<WpcomConfigurator term={ term } onQuantityChange={ setQuantity } />
						<OrderSummary
							brand="wpcom"
							term={ term }
							quantity={ quantity }
							onCheckout={ handleCheckout }
						/>
					</div>
				</VStack>
			) }
			{ selectedBrand === 'pressable' && (
				<VStack spacing={ 4 }>
					<div className="marketplace-hosting__configurator-row">
						<PressableContent
							planSlug={ pressablePlanSlug }
							onPlanChange={ setPressablePlanSlug }
						/>
						<OrderSummary
							brand="pressable"
							term={ term }
							quantity={ 1 }
							plan={ pressablePlan }
							onCheckout={ handleCheckout }
						/>
					</div>
				</VStack>
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
