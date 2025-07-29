import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
	Tooltip,
} from '@wordpress/components';
import { cloneElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	chartBar,
	cloud,
	megaphone,
	next,
	removeBug,
	shield,
	search,
	video,
	wordpress,
} from '@wordpress/icons';
import filesize from 'filesize';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { siteMetricsQuery } from '../../app/queries/site-metrics';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { Stat } from '../../components/stat';
import { DotcomPlans, JetpackFeatures } from '../../data/constants';
import { hasPlanFeature } from '../../utils/site-features';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { getSiteDisplayUrl } from '../../utils/site-url';
import OverviewCard from '../overview-card';
import type { Site, Purchase } from '../../data/types';

import './style.scss';

const MINIMUM_DISPLAYED_USAGE = 2.5;
const ALERT_PERCENT = 80;

const JETPACK_PRODUCTS = [
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-stats.php#L82
		id: JetpackFeatures.STATS,
		icon: chartBar,
		label: __( 'Stats' ),
		description: __( 'Clear, concise, and actionable analysis of your site performance.' ),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-backup.php#L80
		id: JetpackFeatures.BACKUPS,
		icon: cloud,
		label: __( 'VaultPress Backup' ),
		description: __(
			'Real-time backups save every change, and one-click restores get you back online quickly.'
		),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-social.php#L78
		id: JetpackFeatures.SOCIAL_ENHANCED_PUBLISHING,
		icon: megaphone,
		label: __( 'Social' ),
		description: __(
			'Auto‑share your posts to social networks and track engagement in one place.'
		),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-boost.php#L87
		id: JetpackFeatures.CLOUD_CRITICAL_CSS,
		icon: next,
		label: __( 'Boost' ),
		description: __( 'Improves your site speed and performance.' ),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-anti-spam.php#L51
		id: JetpackFeatures.ANTISPAM,
		icon: removeBug,
		label: __( 'Akismet Anti-spam' ),
		description: __( 'Automatically clear spam from comments and forms.' ),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-search.php#L94
		id: JetpackFeatures.SEARCH,
		icon: search,
		label: __( 'Search' ),
		description: __( 'Instantly deliver the most relevant results to your visitors.' ),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-scan.php#L46
		id: JetpackFeatures.SCAN,
		icon: shield,
		label: __( 'Scan' ),
		description: __( 'Guard against malware and bad actors 24/7.' ),
	},
	{
		// See: https://github.com/Automattic/jetpack/blob/46e8a181299c296ac8e108daa2f2c6f9761a2d82/projects/packages/my-jetpack/src/products/class-videopress.php#L88
		id: JetpackFeatures.VIDEOPRESS,
		icon: video,
		label: __( 'VideoPress' ),
		description: __( 'Powerful and flexible video hosting.' ),
	},
];

function getCurrentMonthRangeTimestamps() {
	const now = new Date();
	const firstDayOfMonth = new Date( now.getFullYear(), now.getMonth(), 1 );
	const startInSeconds = Math.floor( firstDayOfMonth.getTime() / 1000 );

	const today = new Date();
	today.setMinutes( 59 );
	today.setSeconds( 59 );
	const endInSeconds = Math.floor( today.getTime() / 1000 );

	return {
		startInSeconds,
		endInSeconds,
	};
}

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

function getJetpackProducts( site: Site ) {
	return JETPACK_PRODUCTS.filter( ( product ) =>
		hasPlanFeature( site, product.id as JetpackFeatures )
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
	const products = getJetpackProducts( site );
	const hasProducts = products.length > 0;
	const productsToDisplay = hasProducts ? products : JETPACK_PRODUCTS;
	const isPlanFreeAndHasProducts = site.plan?.is_free && hasProducts;

	return (
		<OverviewCard
			title={ __( 'Subscriptions' ) }
			icon={ <JetpackLogo /> }
			heading={ isPlanFreeAndHasProducts ? __( 'Jetpack' ) : site.plan?.product_name_short }
			description={ getCardDescription( site, purchase ) }
			externalLink={ `https://cloud.jetpack.com/purchases/subscriptions/${ site.slug }` }
			tracksId="plan"
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
	const { data: mediaStorage, isLoading: isLoadingMediaStorage } = useQuery(
		siteMediaStorageQuery( site.ID )
	);

	const { startInSeconds, endInSeconds } = getCurrentMonthRangeTimestamps();
	const { data: bandwidth, isLoading: isLoadingBandwidth } = useQuery( {
		...siteMetricsQuery( site.ID, {
			start: startInSeconds,
			end: endInSeconds,
			metric: 'response_bytes_persec',
		} ),
		enabled: !! site.is_wpcom_atomic,
		select: ( data ) => {
			if ( ! data ) {
				return data;
			}
			const domain = getSiteDisplayUrl( site );
			return data.data.periods.reduce(
				( acc, curr ) => acc + ( curr.dimension[ domain ] || 0 ),
				0
			);
		},

		// Don't update until page is refreshed
		meta: { persist: false },
		staleTime: Infinity,
	} );

	const storageUsagePercent = ! mediaStorage
		? 0
		: Math.round(
				( ( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes ) * 1000 ) / 10
		  );

	// Ensure that the displayed usage is never fully empty to avoid a confusing UI.
	const progressBarValue = Math.max(
		MINIMUM_DISPLAYED_USAGE,
		Math.min( storageUsagePercent, 100 )
	);

	let storageWarningColor = undefined;
	if ( storageUsagePercent > 100 ) {
		storageWarningColor = 'alert-red' as const;
	} else if ( storageUsagePercent > ALERT_PERCENT ) {
		storageWarningColor = 'alert-yellow' as const;
	}

	const icon = cloneElement( wordpress, {
		style: { color: 'var( --wp-admin-brand-color )' },
	} );

	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ icon }
			heading={ site.plan?.product_name_short }
			description={ getCardDescription( site, purchase ) }
			tracksId="plan"
			isLoading={ isLoading || isLoadingMediaStorage || isLoadingBandwidth }
			link={ site.plan?.is_free ? undefined : '/v2/me/billing/active-subscriptions' }
			bottom={
				<VStack spacing={ 4 }>
					<Stat
						density="high"
						strapline={ __( 'Storage' ) }
						metric={ mediaStorage && filesize( mediaStorage.storage_used_bytes, { round: 0 } ) }
						description={ mediaStorage && filesize( mediaStorage.max_storage_bytes, { round: 0 } ) }
						progressValue={ progressBarValue }
						progressColor={ storageWarningColor }
						progressLabel={ `${ storageUsagePercent }%` }
						isLoading={ isLoadingMediaStorage }
					/>
					<Stat
						density="high"
						strapline={ __( 'Bandwidth' ) }
						metric={
							bandwidth && site.is_wpcom_atomic
								? filesize( bandwidth, { round: 1 } )
								: __( 'Unlimited' )
						}
						description={ site.is_wpcom_atomic ? __( 'Unlimited' ) : undefined }
						progressValue={ 100 }
						progressColor="alert-green"
						isLoading={ isLoadingBandwidth }
					/>
				</VStack>
			}
		/>
	);
}

export default function PlanCard( { site }: { site: Site } ) {
	const { data: plan, isLoading: isLoadingPlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: purchase, isLoading: isLoadingPurchase } = useQuery( {
		...sitePurchaseQuery( site.ID, plan?.id ?? '' ),
		enabled: !! plan?.id,
	} );

	if ( isSelfHostedJetpackConnected( site ) ) {
		return (
			<JetpackPlanCard
				site={ site }
				purchase={ purchase }
				isLoading={ isLoadingPlan || isLoadingPurchase }
			/>
		);
	}

	return (
		<WpcomPlanCard
			site={ site }
			purchase={ purchase }
			isLoading={ isLoadingPlan || isLoadingPurchase }
		/>
	);
}

function getCardDescription( site: Site, purchase?: Purchase ) {
	if ( site.plan?.product_slug === DotcomPlans.FREE_PLAN ) {
		return __( 'Upgrade to access all hosting features.' );
	}

	if ( site.plan?.product_slug === DotcomPlans.JETPACK_FREE ) {
		return getJetpackProducts( site ).length > 0
			? __( 'Manage subscriptions.' )
			: __( 'Upgrade to access more Jetpack tools.' );
	}

	if ( purchase?.expiry_message ) {
		return purchase.expiry_message;
	}

	if ( purchase?.partner_name ) {
		return sprintf(
			/* translators: %s: the partner name, e.g.: "Jetpack" */
			__( 'Managed by %s.' ),
			purchase.partner_name
		);
	}

	return undefined;
}
