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
import { ReferralModeBand, referralTreatment } from '../referral-mode-pass';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { useMarketplaceType } from '../use-marketplace-type';
import { useOwnedWpcomSites } from '../use-owned-wpcom-sites';
import { useTermPricing } from '../use-term-pricing';
import HostCards from './host-cards';
import { getHost } from './hosts';
import { getPressablePlanName } from './lib/pressable-plans';
import { getEffectivePressableOwnership } from './lib/pressable-products';
import PressableOffers from './pressable-offer-banner';
import PressableSection from './pressable-section';
import PressableUsageLimitNotice from './pressable-usage-limit-notice';
import VipSection from './vip-section';
import WpcomSection from './wpcom-section';
import type { HostingSection } from '../paths';
import type { AgencyProduct } from '@automattic/api-core';

import './style.scss';

/**
 * The Hosting page: the three hosts side by side, then, once one is picked,
 * that host's own page to set up the purchase. `section` names the host page.
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
	const isSmallScreen = useViewportMatch( 'small', '<' );
	const host = section ? getHost( section ) : undefined;

	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const agencyApproved = isAgencyApproved( agency );

	const { data: allProducts } = useQuery( agencyProductsQuery( agencyId ) );
	const { data: devLicenses } = useQuery( {
		...agencyDevLicensesQuery( agencyId ),
		enabled: agencyId > 0,
	} );
	const { ownedSites: ownedWpcomSites, isReady: isOwnedSitesReady } = useOwnedWpcomSites();
	// What the agency owns is a fact whatever the mode, so the host cards always show it.
	const { ownedSites: allOwnedWpcomSites } = useOwnedWpcomSites( 'regular' );

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
	if ( allOwnedWpcomSites > 0 ) {
		ownedHosting.wpcom = sprintf(
			/* translators: %d is the number of WordPress.com sites the agency owns. */
			_n( 'You own %d site', 'You own %d sites', allOwnedWpcomSites ),
			allOwnedWpcomSites
		);
	}
	if ( agencyPressablePlan ) {
		ownedHosting.pressable = sprintf(
			/* translators: %s is the name of the agency's Pressable plan, e.g. "Signature 3". */
			__( 'Your plan: %s' ),
			getPressablePlanName( agencyPressablePlan.name )
		);
	}

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
						<div className="dashboard-marketplace-hosting__header-actions">
							{ /* The host cards show no price, so the billing term waits for a host page.
							   Below 600px it drops "Billed" so the row still fits. */ }
							{ section && <TermPricingToggle short={ isSmallScreen } /> }
							{ /* Refer and the cart wrap together, so the cart never sits alone. */ }
							<HStack spacing={ isSmallScreen ? 2 : 4 } expanded={ false }>
								<ReferralToggle label={ __( 'Refer hosting' ) } earn={ __( 'Earn 20%' ) } />
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
						</div>
					}
				/>
			}
		>
			{ isReferralMode && referralTreatment() === 'hb' && (
				<ReferralModeBand
					kind="hosting"
					headline={ __(
						'Your client pays the retail price. You earn 20% recurring commission on their\u00a0hosting.'
					) }
					summary={ __( 'Your client pays. You earn 20% recurring commission on hosting.' ) }
				/>
			) }
			<PressableUsageLimitNotice agency={ agency } />
			<PressableOffers agency={ agency } />
			{ section ? (
				renderSection( section )
			) : (
				<HostCards
					owned={ ownedHosting }
					isReferralMode={ isReferralMode }
					onPick={ handleHostPick }
				/>
			) }
		</PageLayout>
	);
}
