import {
	Button,
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { ClientRelationships, IncludedFeatures, Testimonials } from './content-sections';
import { hostingBrands, formatUSD, pressableSignature1 } from './mock-data';
import ProductSelector from './product-selector';
import WpcomConfigurator from './wpcom-configurator';
import type { HostingBrand } from './mock-data';

import './style.scss';

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
							'Included with Automattic for Agencies. Build up to 5 WordPress.com sites free, and pay only when you launch. 5 of 5 free licenses available.'
						) }
					</Text>
					<Button variant="secondary" __next40pxDefaultSize>
						{ __( 'Create a development site' ) }
					</Button>
				</VStack>
			</CardBody>
		</Card>
	);
}

function PressableContent( { onAddToCart }: { onAddToCart: ( quantity: number ) => void } ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<VStack spacing={ 1 }>
						<Heading level={ 2 } size={ 16 }>
							{ __( 'Pressable' ) }
						</Heading>
						<Text variant="muted">
							{ __( 'One pooled plan sized by total WordPress installs, traffic, and storage.' ) }
						</Text>
					</VStack>
					<HStack justify="space-between" alignment="center">
						<VStack spacing={ 1 }>
							<Text weight={ 600 }>{ __( 'Signature 1' ) }</Text>
							<Text variant="muted">
								{ __( '1 WordPress install · 30K visits per month · 20GB storage' ) }
							</Text>
							<Text weight={ 600 }>{ `${ formatUSD( pressableSignature1.yearly_price ) } ${ __(
								'per year'
							) }` }</Text>
						</VStack>
						<Button variant="primary" __next40pxDefaultSize onClick={ () => onAddToCart( 1 ) }>
							{ __( 'Add to cart' ) }
						</Button>
					</HStack>
					<Text variant="muted">
						{ __(
							'Prototype note: full plan selection (Signature 1–17, Premium, sizing by installs, traffic, or storage) ports over from the current Marketplace in a follow-up.'
						) }
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}

function VipContent() {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<VStack spacing={ 1 }>
						<Heading level={ 2 } size={ 16 }>
							{ __( 'WordPress VIP' ) }
						</Heading>
						<Text variant="muted">
							{ __(
								'Enterprise-grade WordPress with custom pricing, guided onboarding, and dedicated support.'
							) }
						</Text>
					</VStack>
					<HStack justify="flex-start" spacing={ 3 }>
						<Button
							variant="primary"
							__next40pxDefaultSize
							href="https://wpvip.com/get-a-demo/?utm_source=partner&utm_medium=referral&utm_campaign=a4a"
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Request a demo ↗' ) }
						</Button>
						<Button variant="secondary" __next40pxDefaultSize>
							{ __( 'Refer your client to VIP hosting' ) }
						</Button>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function MarketplaceHosting() {
	const [ selectedBrand, setSelectedBrand ] = useState< HostingBrand[ 'key' ] >( 'wpcom' );
	const [ term, setTerm ] = useState< 'monthly' | 'yearly' >( 'yearly' );
	const [ isReferralMode, setIsReferralMode ] = useState( false );
	const [ cartCount, setCartCount ] = useState( 0 );

	const handleAddToCart = ( quantity: number ) => {
		setCartCount( quantity );
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
									label={ __( 'Bill yearly' ) }
									hideLabelFromVision
									onChange={ ( checked ) => setTerm( checked ? 'yearly' : 'monthly' ) }
								/>
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
			<MigrationOffer />
			<ProductSelector
				brands={ hostingBrands }
				selected={ selectedBrand }
				onSelect={ setSelectedBrand }
			/>
			{ selectedBrand === 'wpcom' && (
				<div className="marketplace-hosting__configurator-row">
					<WpcomConfigurator term={ term } onAddToCart={ handleAddToCart } />
					<FreeDevSites />
				</div>
			) }
			{ selectedBrand === 'pressable' && <PressableContent onAddToCart={ handleAddToCart } /> }
			{ selectedBrand === 'vip' && <VipContent /> }
			{ selectedBrand !== 'vip' && <IncludedFeatures /> }
			<Testimonials />
			<ClientRelationships />
		</PageLayout>
	);
}
