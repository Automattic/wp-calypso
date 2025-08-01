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
import { wordpress } from '@wordpress/icons';
import filesize from 'filesize';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { siteMetricsQuery } from '../../app/queries/site-metrics';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { Stat } from '../../components/stat';
import { DotcomPlans } from '../../data/constants';
import {
	getJetpackProductsForSite,
	getSitePlanDisplayName,
	JETPACK_PRODUCTS,
} from '../../utils/site-plan';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { getSiteDisplayUrl } from '../../utils/site-url';
import OverviewCard from '../overview-card';
import type { Site, Purchase } from '../../data/types';

import './style.scss';

const MINIMUM_DISPLAYED_USAGE = 2.5;
const ALERT_PERCENT = 80;

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

function JetpackPlanCard( {
	site,
	purchase,
	isLoading,
}: {
	site: Site;
	purchase?: Purchase;
	isLoading: boolean;
} ) {
	const products = getJetpackProductsForSite( site );
	const productsToDisplay = products.length > 0 ? products : JETPACK_PRODUCTS;

	return (
		<OverviewCard
			title={ __( 'Subscriptions' ) }
			icon={ <JetpackLogo /> }
			heading={ getSitePlanDisplayName( site ) }
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
			heading={ getSitePlanDisplayName( site ) }
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
		return getJetpackProductsForSite( site ).length > 0
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
