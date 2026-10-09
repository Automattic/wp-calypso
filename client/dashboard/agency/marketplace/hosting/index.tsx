import {
	activeAgencyQuery,
	agencyDevLicensesQuery,
	agencyProductsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { isAgencyApproved } from '../is-agency-approved';
import { getWpcomPlan } from '../lib/wpcom-hosting';
import CartMenu from '../products/cart-menu';
import { useCartOpen, useShoppingCart } from '../products/use-shopping-cart';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { useMarketplaceType } from '../use-marketplace-type';
import { useOwnedWpcomSites } from '../use-owned-wpcom-sites';
import { useTermPricing } from '../use-term-pricing';
import HostCards from './host-cards';
import { getHost } from './hosts';
import {
	getPressablePlanInfo,
	getPressablePlanName,
	hasPressableUpgrade,
} from './lib/pressable-plans';
import { getEffectivePressableOwnership } from './lib/pressable-products';
import PressableOffers from './pressable-offer-banner';
import PressableSection from './pressable-section';
import PressableUsageLimitNotice from './pressable-usage-limit-notice';
import VipSection from './vip-section';
import WpcomSection from './wpcom-section';
import type { HostingSection } from '../paths';
import type { PressablePlan } from './lib/pressable-plans';
import type { AgencyProduct } from '@automattic/api-core';

import './style.scss';

/**
 * `/hosting` shows the hosts side by side; `section` is the page of one host.
 *
 * TODO: Still missing from the classic Hosting page:
 * - the agency approval notice (pending / approved / rejected)
 * - the guided tour
 */
export default function MarketplaceHosting( { section }: { section?: HostingSection } ) {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();
	const isReferralMode = marketplaceType === 'referral';
	const host = section ? getHost( section ) : undefined;
	const isSmallScreen = useViewportMatch( 'small', '<' );
	const isBelowLarge = useViewportMatch( 'large', '<' );

	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const agencyApproved = isAgencyApproved( agency );

	const { data: allProducts } = useQuery( agencyProductsQuery( agencyId ) );
	const { data: devLicenses } = useQuery( {
		...agencyDevLicensesQuery( agencyId ),
		enabled: agencyId > 0,
	} );
	const { ownedSites: ownedWpcomSites, isReady: isOwnedSitesReady } = useOwnedWpcomSites();
	// The host cards show what the agency owns in either mode.
	const { ownedSites: agencyOwnedWpcomSites } = useOwnedWpcomSites( 'regular' );

	const wpcomPlan = useMemo( () => getWpcomPlan( allProducts ?? [] ), [ allProducts ] );

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

	const { items: cartItems, swapItems, removeItem } = useShoppingCart();
	const [ isCartOpen, setIsCartOpen ] = useCartOpen();

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

	const ownedHosting: Partial< Record< HostingSection, string > > = {};
	if ( agencyOwnedWpcomSites > 0 ) {
		ownedHosting.wpcom = sprintf(
			/* translators: %d is the number of WordPress.com sites the agency owns. */
			_n( 'You own %d site', 'You own %d sites', agencyOwnedWpcomSites ),
			agencyOwnedWpcomSites
		);
	}
	if ( agencyPressablePlan ) {
		ownedHosting.pressable = sprintf(
			/* translators: %s is the name of the agency's Pressable plan, e.g. "Signature 3". */
			__( 'Your plan: %s' ),
			getPressablePlanName( agencyPressablePlan.name )
		);
	}

	const agencyPressablePlanInfo = agencyPressablePlan
		? getPressablePlanInfo( agencyPressablePlan )
		: undefined;
	const isOnTopPressablePlan =
		!! agencyPressablePlanInfo &&
		! hasPressableUpgrade(
			agencyPressablePlanInfo,
			pressableProducts
				.map( getPressablePlanInfo )
				.filter( ( plan ): plan is PressablePlan => !! plan )
		);

	const handleHostPick = ( picked: HostingSection ) => {
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_host_click', { host: picked } );
	};

	const renderSection = ( brand: HostingSection ) => {
		if ( brand === 'wpcom' ) {
			if ( ! wpcomPlan ) {
				return null;
			}
			return (
				<WpcomSection
					plan={ wpcomPlan }
					term={ termPricing }
					isReferralMode={ isReferralMode }
					ownedSites={ ownedWpcomSites }
					isOwnedSitesReady={ isOwnedSitesReady }
					isAgencyApproved={ agencyApproved }
					availableDevSites={ devLicenses?.available }
					onAddToCart={ addToCart }
				/>
			);
		}
		if ( brand === 'pressable' ) {
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
		}
		return <VipSection isReferralMode={ isReferralMode } />;
	};

	return (
		<PageLayout
			header={
				<PageHeader
					prefix={ host ? <Breadcrumbs length={ 2 } /> : undefined }
					title={ host ? host.name : __( 'Hosting' ) }
					description={
						host
							? host.bestFor
							: __(
									'Buy hosting for your clients’ sites directly, or refer it to clients and earn commission.'
								)
					}
					actions={
						// Below large the controls can wrap under the title, so they line up with it.
						<HStack spacing={ 4 } justify={ isBelowLarge ? 'flex-start' : 'flex-end' } wrap>
							{ /* Only the WordPress.com and Pressable pages show prices. */ }
							{ section && section !== 'vip' && <TermPricingToggle short={ isSmallScreen } /> }
							<HStack spacing={ 4 } expanded={ false }>
								<ReferralToggle label={ __( 'Refer hosting' ) } />
								<CartMenu
									items={ cartItems }
									products={ allProducts ?? [] }
									term={ termPricing }
									isReferralMode={ isReferralMode }
									isAgencyApproved={ agencyApproved }
									isLegacyBilling={ agency?.billing_system === 'legacy' }
									open={ isCartOpen }
									onToggle={ setIsCartOpen }
									onRemove={ removeItem }
								/>
							</HStack>
						</HStack>
					}
				/>
			}
		>
			<PressableUsageLimitNotice agency={ agency } />
			<PressableOffers agency={ agency } />
			{ section ? (
				renderSection( section )
			) : (
				<HostCards
					owned={ ownedHosting }
					isReferralMode={ isReferralMode }
					isOnTopPressablePlan={ isOnTopPressablePlan }
					onPick={ handleHostPick }
				/>
			) }
		</PageLayout>
	);
}
