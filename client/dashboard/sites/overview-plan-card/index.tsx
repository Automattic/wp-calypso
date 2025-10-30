import { DotcomPlans } from '@automattic/api-core';
import { siteCurrentPlanQuery, siteByIdQuery, purchaseQuery } from '@automattic/api-queries';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
	Tooltip,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { commerceGardenPlan } from '../../components/icons';
import OverviewCard from '../../components/overview-card';
import { PurchaseExpiryStatus } from '../../components/purchase-expiry-status';
import {
	getJetpackProductsForSite,
	getSitePlanDisplayName,
	useSitePlanManageURL,
	JETPACK_PRODUCTS,
} from '../../utils/site-plan';
import { isSelfHostedJetpackConnected, isCommerceGarden } from '../../utils/site-types';
import SiteBandwidthStat from './site-bandwidth-stat';
import SiteStorageStat from './site-storage-stat';
import type { Purchase, Site } from '@automattic/api-core';
import './style.scss';

function getJetpackProductsDescription( products: typeof JETPACK_PRODUCTS ) {
	if ( products.length === JETPACK_PRODUCTS.length ) {
		return __( 'The full Jetpack suite with everything you need to grow your business.' );
	}

	if ( products.length === 0 ) {
		return __( 'Enhance your site with Jetpack security, performance, and growth tools.' );
	}

	if ( products.length === 1 ) {
		return products[ 0 ].description;
	}

	return `${ products.map( ( product ) => product.label ).join( ', ' ) }.`;
}

function SitePlanStats( { site }: { site: Site } ) {
	return (
		<VStack spacing={ 4 }>
			<SiteStorageStat site={ site } />
			<SiteBandwidthStat site={ site } />
		</VStack>
	);
}

function JetpackPlanCard( {
	site,
	purchase,
	isLoading,
}: {
	site: Site;
	purchase?: Purchase;
	isLoading: boolean;
} ) {
	const url = useSitePlanManageURL( site );
	const products = getJetpackProductsForSite( site );
	const productsToDisplay = products.length > 0 ? products : JETPACK_PRODUCTS;

	return (
		<OverviewCard
			title={ __( 'Subscriptions' ) }
			icon={ <JetpackLogo /> }
			heading={ getSitePlanDisplayName( site ) }
			description={ getCardDescription( site, purchase ) }
			link={ url }
			tracksId="site-overview-plan"
			isLoading={ isLoading }
			bottom={
				<VStack spacing={ 3 }>
					<Grid
						className="jetpack-plan-card__icons"
						columns={ 4 }
						rows={ Math.ceil( productsToDisplay.length / 4 ) }
						gap={ 2 }
					>
						{ productsToDisplay.map( ( product ) => (
							<Tooltip key={ product.id } text={ product.label } placement="top">
								<div tabIndex={ -1 }>
									<Icon icon={ product.icon } />
								</div>
							</Tooltip>
						) ) }
					</Grid>
					<Text variant="muted" lineHeight="16px" size={ 12 }>
						{ getJetpackProductsDescription( products ) }
					</Text>
				</VStack>
			}
		/>
	);
}

function WpcomPlanCard( {
	site,
	purchase,
	isLoading,
}: {
	site: Site;
	purchase?: Purchase;
	isLoading: boolean;
} ) {
	const url = useSitePlanManageURL( site, purchase );
	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ wordpress }
			heading={ getSitePlanDisplayName( site ) }
			description={ getCardDescription( site, purchase ) }
			link={ url }
			tracksId="site-overview-plan"
			isLoading={ isLoading }
			bottom={ <SitePlanStats site={ site } /> }
		/>
	);
}

function WpcomStagingSitePlanCard( { site }: { site: Site } ) {
	const { data: productionSite, isLoading: isLoadingProductionSite } = useQuery(
		siteByIdQuery( site.options?.wpcom_production_blog_id ?? 0 )
	);

	const description = sprintf(
		/* translators: %s: the site plan name */
		__( 'Included with your %s plan.' ),
		productionSite?.plan?.product_name_short
	);

	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ wordpress }
			heading={ getSitePlanDisplayName( site ) }
			description={ description }
			tracksId="site-overview-plan"
			isLoading={ isLoadingProductionSite }
			bottom={ <SitePlanStats site={ site } /> }
		/>
	);
}

function AgencyPlanCard( { site, isLoading }: { site: Site; isLoading: boolean } ) {
	const url = useSitePlanManageURL( site );
	return (
		<OverviewCard
			title={ __( 'Development license' ) }
			icon={ wordpress }
			heading={ getSitePlanDisplayName( site ) }
			description={ __( 'Managed by Automattic for Agencies.' ) }
			link={ url }
			tracksId="site-overview-plan"
			isLoading={ isLoading }
			bottom={ <SitePlanStats site={ site } /> }
		/>
	);
}

function CommerceGardenPlanCard( {
	site,
	purchase,
	isLoading,
}: {
	site: Site;
	purchase?: Purchase;
	isLoading: boolean;
} ) {
	const url = useSitePlanManageURL( site, purchase );
	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ commerceGardenPlan }
			heading={ getSitePlanDisplayName( site ) }
			description={ getCardDescription( site, purchase ) }
			link={ url }
			tracksId="plan"
			isLoading={ isLoading }
		/>
	);
}

export default function PlanCard( { site }: { site: Site } ) {
	const { data: plan, isLoading: isLoadingPlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: purchase, isLoading: isLoadingPurchase } = useQuery( {
		...purchaseQuery( plan?.id ?? 0 ),
		enabled: !! plan?.id,
	} );

	const isLoading = isLoadingPlan || isLoadingPurchase;

	if ( site.is_a4a_dev_site ) {
		return <AgencyPlanCard site={ site } isLoading={ isLoading } />;
	}

	if ( isCommerceGarden( site ) ) {
		return <CommerceGardenPlanCard site={ site } purchase={ purchase } isLoading={ isLoading } />;
	}

	if ( isSelfHostedJetpackConnected( site ) ) {
		return <JetpackPlanCard site={ site } purchase={ purchase } isLoading={ isLoading } />;
	}

	if ( site.is_wpcom_staging_site ) {
		return <WpcomStagingSitePlanCard site={ site } />;
	}

	return <WpcomPlanCard site={ site } purchase={ purchase } isLoading={ isLoading } />;
}

function getCardDescription( site: Site, purchase?: Purchase ) {
	if ( site.plan?.product_slug === DotcomPlans.FREE_PLAN ) {
		return __( 'Upgrade to access all hosting features.' );
	}

	if ( site.plan?.product_slug === DotcomPlans.JETPACK_FREE ) {
		return getJetpackProductsForSite( site ).length > 0
			? __( 'Manage subscriptions.' )
			: __( 'Upgrade to access more Jetpack tools.' );
	}

	if ( purchase ) {
		return <PurchaseExpiryStatus purchase={ purchase } />;
	}

	return undefined;
}
