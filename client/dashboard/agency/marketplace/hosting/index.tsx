import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	privateApis,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { isAgencyApproved } from '../is-agency-approved';
import { getMarketplaceHostingSectionRoute } from '../paths';
import CartMenu from '../products/cart-menu';
import { useShoppingCart } from '../products/use-shopping-cart';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { useMarketplaceType } from '../use-marketplace-type';
import { useTermPricing } from '../use-term-pricing';
import { getEffectivePressableOwnership } from './lib/pressable-products';
import PressableSection from './pressable-section';
import type { HostingSection } from '../paths';
import type { AgencyProduct } from '@automattic/api-core';

import './style.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

// Same private Tabs the Performance and Plugins screens use; unlike TabPanel it
// renders arbitrary tab content, so each tier can carry its one-line guidance.
const { Tabs } = unlock( privateApis );

const getHostingBrands = (): { key: HostingSection; tier: string; subtitle: string }[] => [
	{
		key: 'wpcom',
		tier: __( 'Standard Agency Hosting' ),
		subtitle: __( 'Optimized and hassle-free hosting' ),
	},
	{
		key: 'pressable',
		tier: __( 'Premier Agency Hosting' ),
		subtitle: __( 'Best for large-scale businesses' ),
	},
	{
		key: 'vip',
		tier: __( 'Enterprise' ),
		subtitle: __( 'WordPress for enterprise-level demands' ),
	},
];

// Placeholder content until the WordPress.com and VIP sections land.
const PLACEHOLDERS: Record< Exclude< HostingSection, 'pressable' >, string > = {
	wpcom: 'WordPress.com hosting content will appear here.',
	vip: 'WordPress VIP hosting content will appear here.',
};

// TODO: Still missing from the classic Hosting page:
// - the agency approval notice (pending / approved / rejected)
// - the guided tour
export default function MarketplaceHosting( { section }: { section: HostingSection } ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();
	const isReferralMode = marketplaceType === 'referral';
	const hostingBrands = getHostingBrands();

	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const agencyApproved = isAgencyApproved( agency );

	const { data: allProducts } = useQuery( agencyProductsQuery( agencyId ) );
	const {
		plan: agencyPressablePlan,
		products: pressableProducts,
		ownership: pressableOwnership,
		isReady: isPressableReady,
	} = useAgencyPressablePlan();
	const effectivePressableOwnership = getEffectivePressableOwnership(
		pressableOwnership,
		agencyPressablePlan,
		isReferralMode
	);

	const { items: cartItems, swapItems, removeItem, clearCart } = useShoppingCart();
	const [ isCartOpen, setIsCartOpen ] = useState( false );

	// A hosting plan replaces the plan of the same family already in the cart.
	const addToCart = ( plan: AgencyProduct, quantity: number ) => {
		const sameFamilySlugs = cartItems
			.map( ( item ) => allProducts?.find( ( product ) => product.slug === item.slug ) )
			.filter( ( product ): product is AgencyProduct => !! product )
			.filter( ( product ) => product.family_slug === plan.family_slug )
			.map( ( product ) => product.slug );
		swapItems( sameFamilySlugs, { slug: plan.slug, quantity } );
		setIsCartOpen( true );
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_add_to_cart', {
			quantity,
			item: plan.family_slug,
			purchase_mode: marketplaceType,
			term_pricing: termPricing,
		} );
	};

	const handleSectionChange = ( tab: string | null | undefined ) => {
		if ( ! tab || tab === section ) {
			return;
		}
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_tab_click', { tab } );
		navigate( { to: getMarketplaceHostingSectionRoute( tab as HostingSection ) } );
	};

	const renderSection = ( brand: HostingSection ) => {
		if ( brand !== 'pressable' ) {
			return <Text variant="muted">{ PLACEHOLDERS[ brand ] }</Text>;
		}
		if ( ! isPressableReady ) {
			return null;
		}
		return (
			<PressableSection
				products={ pressableProducts }
				existingPlan={ agencyPressablePlan }
				ownership={ effectivePressableOwnership }
				term={ termPricing }
				isReferralMode={ isReferralMode }
				onAddToCart={ addToCart }
			/>
		);
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Hosting' ) }
					description={ __(
						'Choose the right hosting for each client, from single sites to enterprise platforms.'
					) }
					actions={
						<HStack spacing={ 4 } expanded={ false }>
							<ReferralToggle />
							<CartMenu
								items={ cartItems }
								products={ allProducts ?? [] }
								term={ termPricing }
								isReferralMode={ isReferralMode }
								isAgencyApproved={ agencyApproved }
								open={ isCartOpen }
								onToggle={ setIsCartOpen }
								onRemove={ removeItem }
								onCheckout={ clearCart }
							/>
						</HStack>
					}
				/>
			}
		>
			<Tabs selectedTabId={ section } onSelect={ handleSectionChange }>
				<VStack spacing={ 0 }>
					<HStack justify="space-between" wrap>
						<Tabs.TabList>
							{ hostingBrands.map( ( brand ) => (
								<Tabs.Tab key={ brand.key } tabId={ brand.key }>
									<VStack spacing={ 0.5 } alignment="flex-start">
										<span>{ brand.tier }</span>
										<Text variant="muted" size={ 12 } lineHeight="16px">
											{ brand.subtitle }
										</Text>
									</VStack>
								</Tabs.Tab>
							) ) }
						</Tabs.TabList>
						<TermPricingToggle />
					</HStack>
					<Divider style={ { color: 'var(--dashboard-overview__divider-color)' } } />
				</VStack>
				{ hostingBrands.map( ( brand ) => (
					<Tabs.TabPanel key={ brand.key } tabId={ brand.key }>
						{ brand.key === section && renderSection( brand.key ) }
					</Tabs.TabPanel>
				) ) }
			</Tabs>
		</PageLayout>
	);
}
