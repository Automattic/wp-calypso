import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import {
	Icon,
	blockMeta,
	code,
	desktop,
	globe,
	login,
	reusableBlock,
	external,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useWPCOMOwnedSites from 'calypso/a8c-for-agencies/hooks/use-wpcom-owned-sites';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingOverview from '../common/hosting-overview';
import HostingOverviewFeatures from '../common/hosting-overview-features';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useProductAndPlans from '../hooks/use-product-and-plans';
import useShoppingCart from '../hooks/use-shopping-cart';
import { getWPCOMCreatorPlan } from '../lib/hosting';
import ShoppingCart from '../shopping-cart';
import WPCOMBulkSelector from './bulk-selection';
import wpcomBulkOptions from './lib/wpcom-bulk-options';
import { DiscountTier } from './lib/wpcom-bulk-values-utils';
import WPCOMPlanCard from './wpcom-card';

import './style.scss';

function WpcomOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const { marketplaceType, toggleMarketplaceType } = useContext( MarketplaceTypeContext );
	const referralMode = marketplaceType === 'referral';

	const {
		selectedCartItems,
		onRemoveCartItem,
		setSelectedCartItems,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart();

	const { count: ownedPlans, isReady: isLicenseCountsReady } = useWPCOMOwnedSites();

	const options = wpcomBulkOptions( [] );

	const [ selectedTier, setSelectedTier ] = useState< DiscountTier >( options[ 0 ] );

	const onSelectTier = ( tier: DiscountTier ) => {
		setSelectedTier( tier );
	};

	const { wpcomPlans } = useProductAndPlans( {} );

	const creatorPlan = getWPCOMCreatorPlan( wpcomPlans );

	// For referral mode we only display 1 option.
	const displayQuantity = referralMode ? 1 : ( selectedTier.value as number ) - ownedPlans;
	const displayDiscount = referralMode ? options[ 0 ].discount : selectedTier.discount;

	const onclickMoreInfo = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_wpcom_view_all_features_click' )
		);
	}, [ dispatch ] );

	const onAddToCart = useCallback(
		( plan: APIProductFamilyProduct, quantity: number ) => {
			if ( plan ) {
				// We will need to remove first any existing Pressable plan in the cart as we do not allow multiple Pressable plans to be purchase.
				const items = selectedCartItems?.filter(
					( cartItem ) => cartItem.family_slug !== 'wpcom-hosting'
				);

				setSelectedCartItems( [ ...items, { ...plan, quantity } ] );
				setShowCart( true );
			}
		},
		[ selectedCartItems, setSelectedCartItems, setShowCart ]
	);

	const WPCOM_PRICING_PAGE_LINK = 'https://wordpress.com/pricing/';

	return (
		<Layout className="wpcom-overview" title={ translate( 'WordPress.com hosting' ) } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label: translate( 'Marketplace' ),
								href: A4A_MARKETPLACE_LINK,
							},
							{
								label: translate( 'Hosting' ),
								href: A4A_MARKETPLACE_HOSTING_LINK,
							},
							{
								label: translate( 'WordPress.com hosting' ),
							},
						] }
					/>

					<Actions className="a4a-marketplace__header-actions">
						<MobileSidebarNavigation />
						{ isAutomatedReferrals && (
							<div className="a4a-marketplace__toggle-marketplace-type">
								<ToggleControl
									onChange={ toggleMarketplaceType }
									checked={ marketplaceType === 'referral' }
									id="a4a-marketplace__toggle-marketplace-type"
									label={ translate( 'Refer products' ) }
								/>
								<Gridicon icon="info-outline" size={ 16 } />
							</div>
						) }
						<ShoppingCart
							showCart={ showCart }
							setShowCart={ setShowCart }
							toggleCart={ toggleCart }
							items={ selectedCartItems }
							onRemoveItem={ onRemoveCartItem }
							onCheckout={ () => {
								page( A4A_MARKETPLACE_CHECKOUT_LINK );
							} }
						/>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<HostingOverview
					slug="wpcom-hosting"
					title={ translate( 'Powerful WordPress Hosting' ) }
					subtitle={ translate(
						'When you build and host your sites with WordPress.com, everything’s integrated, secure, and scalable.'
					) }
				/>

				{ ! referralMode && (
					<WPCOMBulkSelector
						selectedTier={ selectedTier }
						onSelectTier={ onSelectTier }
						ownedPlans={ ownedPlans }
						isLoading={ ! isLicenseCountsReady }
					/>
				) }

				{ creatorPlan && (
					<WPCOMPlanCard
						plan={ creatorPlan }
						quantity={ displayQuantity } // We only calculate the difference between the selected tier and the owned plans
						discount={ displayDiscount }
						onSelect={ onAddToCart }
						isLoading={ ! isLicenseCountsReady }
					/>
				) }

				<HostingOverview
					title={ translate( 'Powerful development & platform tools' ) }
					subtitle={ translate( 'Built for developers, by developers' ) }
				/>

				<HostingOverviewFeatures
					items={ [
						{
							icon: code,
							title: translate( 'WPI-CLI' ),
							description: translate(
								`Run WP-CLI commands to manage users, plugins, themes, site settings, and more.`
							),
						},
						{
							icon: login,
							title: translate( 'SSH/SFTP' ),
							description: translate(
								'Effortlessly transfer files to and from your site using SFTP and SSH on WordPress.com.'
							),
						},
						{
							icon: reusableBlock,
							title: translate( 'Staging sites' ),
							description: translate(
								`Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.`
							),
						},
						{
							icon: desktop,
							title: translate( 'Local development environment' ),
							description: translate(
								'Build fast, ship faster with Studio by WordPress.com, a new local development environment.'
							),
						},
						{
							icon: globe,
							title: translate( 'Domain management' ),
							description: translate(
								'Everything you need to manage your domains—from registration, transfer, and mapping to DNS configuration, email forwarding, and privacy.'
							),
						},
						{
							icon: blockMeta,
							title: translate( 'Easy site migration' ),
							description: translate(
								'Import and take any WordPress site further with our developer-first tools and secure, lightning-fast platform.'
							),
						},
					] }
				/>

				<section className="pressable-overview__footer">
					<Button
						className="pressable-overview__learn-more-link"
						href={ WPCOM_PRICING_PAGE_LINK }
						onClick={ onclickMoreInfo }
						target="_blank"
					>
						{ translate( 'View all WordPress.com features' ) }
						<Icon icon={ external } size={ 18 } />
					</Button>
				</section>
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( WpcomOverview );
