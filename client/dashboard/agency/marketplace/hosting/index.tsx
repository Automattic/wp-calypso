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
import { SectionHeader } from '../../../components/section-header';
import {
	ClientRelationships,
	IncludedFeatures,
	JetpackComplete,
	Testimonials,
} from './content-sections';
import { hostingBrands } from './mock-data';
import PressableContent from './pressable-content';
import ProductSelector from './product-selector';
import VipContent from './vip-content';
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
							'Included in your membership to Automattic for Agencies. Develop up to 5 WordPress.com sites with free development licenses. Only pay when you launch.'
						) }
					</Text>
					<Text variant="muted" size={ 12 }>
						{ __( '5 of 5 free licenses available' ) }
					</Text>
					<Button variant="secondary" __next40pxDefaultSize>
						{ __( 'Create a development site' ) }
					</Button>
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
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Purchase sites individually or in bulk, as you need them' ) }
						level={ 2 }
					/>
					<div className="marketplace-hosting__configurator-row">
						<WpcomConfigurator term={ term } onAddToCart={ handleAddToCart } />
						<FreeDevSites />
					</div>
				</VStack>
			) }
			{ selectedBrand === 'pressable' && <PressableContent onAddToCart={ handleAddToCart } /> }
			{ selectedBrand === 'vip' && <VipContent /> }
			{ selectedBrand !== 'vip' && (
				<IncludedFeatures brand={ selectedBrand as 'wpcom' | 'pressable' } />
			) }
			{ selectedBrand === 'pressable' && <JetpackComplete /> }
			<Testimonials brand={ selectedBrand } />
			{ selectedBrand !== 'vip' && <ClientRelationships /> }
		</PageLayout>
	);
}
