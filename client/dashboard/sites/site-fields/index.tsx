import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import {
	siteLastBackupQuery,
	siteMediaStorageQuery,
	sitePHPVersionQuery,
	siteEngagementStatsQuery,
	siteUptimeQuery,
} from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { useInView } from 'react-intersection-observer';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import SiteIcon from '../../components/site-icon';
import { Text } from '../../components/text';
import { TextBlur } from '../../components/text-blur';
import TimeSince from '../../components/time-since';
import { addTransientViewPropertiesToQueryParams } from '../../utils/dashboard-v1-sync';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { wpcomLink } from '../../utils/link';
import { getSiteBadge } from '../../utils/site-badge';
import { hasHostingFeature, hasJetpackModule } from '../../utils/site-features';
import { getSiteFormattedUrl } from '../../utils/site-url';
import { getVisibilityLabels } from '../../utils/site-visibility';
import { canManageSite } from '../features';
import { isSitePlanTrial } from '../plans';
import SitePreview from '../site-preview';
import { JetpackLogo } from './jetpack-logo';
import type { SiteBadge, SiteBlockingStatus, SiteVisibility } from '../../types';
import type { Site } from '@automattic/api-core';
import type { ComponentProps } from 'react';

function IneligibleIndicator() {
	return <Text color="#CCCCCC">-</Text>;
}

function LoadingIndicator( { label }: { label: string } ) {
	return <TextBlur>{ label }</TextBlur>;
}

function getSiteManagementUrl( site: Site ) {
	if ( canManageSite( site ) ) {
		const path = `/sites/${ site.slug }`;

		if ( isDashboardBackport() ) {
			return addTransientViewPropertiesToQueryParams( path );
		}

		return path;
	}
	return site.options?.admin_url;
}

export const titleFieldTextOverflowStyles = {
	overflowX: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

export function SiteLink( { site, ...props }: ComponentProps< typeof Link > & { site: Site } ) {
	return (
		<Link
			{ ...props }
			to={ getSiteManagementUrl( site ) }
			disabled={ site.is_deleted }
			style={ { width: 'auto', minWidth: 'unset', textDecoration: 'none', ...props.style } }
		/>
	);
}

export function Name( { site, value }: { site: Site; value: string } ) {
	return <NameRenderer badge={ getSiteBadge( site ) } muted={ site.is_deleted } value={ value } />;
}

export function NameRenderer( {
	badge,
	muted,
	value,
}: {
	badge: SiteBadge;
	muted: boolean;
	value: string;
} ) {
	const renderBadge = () => {
		switch ( badge ) {
			case 'staging':
				return <Badge>{ __( 'Staging' ) }</Badge>;
			case 'trial':
				return <Badge>{ __( 'Trial' ) }</Badge>;
			case 'p2':
				return <Badge>{ __( 'P2' ) }</Badge>;
			case 'deleted':
				return <Badge intent="error">{ __( 'Deleted' ) }</Badge>;
			case 'difm_lite_in_progress':
				return <Badge>{ __( 'Express service' ) }</Badge>;
			case 'migration_pending':
				return <Badge intent="warning">{ __( 'Migration pending' ) }</Badge>;
			case 'migration_started':
				return <Badge intent="info">{ __( 'Migration started' ) }</Badge>;
			default:
				return null;
		}
	};

	const badgeElement = renderBadge();

	return (
		<HStack justify="flex-start" alignment="center" spacing={ 1 }>
			{ muted ? (
				<Text variant="muted">{ value }</Text>
			) : (
				<span style={ titleFieldTextOverflowStyles }>{ value }</span>
			) }
			{ badgeElement && <span style={ { flexShrink: 0 } }>{ badgeElement }</span> }
		</HStack>
	);
}

export function URL( { site, value }: { site: Site; value: string } ) {
	return site.is_deleted ? (
		<Text variant="muted">{ value }</Text>
	) : (
		<ExternalLink
			className="dataviews-url-field"
			style={ titleFieldTextOverflowStyles }
			href={ getSiteFormattedUrl( site ) }
		>
			{ value }
		</ExternalLink>
	);
}

export function SiteIconLink( props: ComponentProps< typeof SiteIcon > ) {
	return (
		<SiteLink site={ props.site } style={ { flexShrink: 0 } }>
			<SiteIcon { ...props } />
		</SiteLink>
	);
}

export function Preview( { site }: { site: Site } ) {
	const [ resizeListener, { width } ] = useResizeObserver();
	const { is_deleted, is_private, URL: url } = site;
	// If the site is a private A8C site, X-Frame-Options is set to same
	// origin.
	const iframeDisabled = is_deleted || ( site.is_a8c && is_private );
	return (
		<div
			style={ {
				display: 'block',
				height: '100%',
				width: '100%',
				borderRadius: 'inherit',
				overflow: 'hidden',
			} }
		>
			{ resizeListener }
			{ iframeDisabled && (
				<div
					style={ {
						fontSize: '24px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
					} }
				>
					<SiteIcon site={ site } />
				</div>
			) }
			{ width && ! iframeDisabled && (
				<SitePreview url={ url } scale={ width / 1200 } height={ 1200 } />
			) }
		</div>
	);
}

export function AsyncEngagementStat( {
	site,
	type,
}: {
	site?: Site;
	type: 'visitors' | 'views' | 'likes';
} ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible =
		! site?.is_deleted && ( ! site?.jetpack || hasJetpackModule( site, JetpackModules.STATS ) );

	const { data: stats, isLoading } = useQuery( {
		...siteEngagementStatsQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID && isEligible && inView,
	} );

	const renderContent = () => {
		if ( ! site || isLoading ) {
			return <LoadingIndicator label="100" />;
		}

		if ( ! isEligible ) {
			return <IneligibleIndicator />;
		}

		return stats?.currentData[ type ];
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function EngagementStat( { value }: { value: number | null } ) {
	return typeof value !== 'number' ? <IneligibleIndicator /> : value;
}

export function LastBackup( { site }: { site?: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = site && hasHostingFeature( site, HostingFeatures.BACKUPS );

	const {
		data: lastBackup,
		isLoading,
		isError,
	} = useQuery( {
		...siteLastBackupQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID && isEligible && inView,
	} );

	const renderContent = () => {
		if ( ! site || isLoading ) {
			return <LoadingIndicator label="Unknown" />;
		}

		if ( ! isEligible ) {
			return <IneligibleIndicator />;
		}

		if ( ! lastBackup || isError ) {
			return <IneligibleIndicator />;
		}

		return <TimeSince timestamp={ lastBackup.published } />;
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function Uptime( { site }: { site?: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = site && hasJetpackModule( site, JetpackModules.MONITOR );

	const { data: uptime, isLoading } = useQuery( {
		...siteUptimeQuery( site?.ID ?? 0, 'week' ),
		enabled: !! site?.ID && isEligible && inView,
	} );

	const renderContent = () => {
		if ( ! site || isLoading ) {
			return <LoadingIndicator label="100%" />;
		}

		if ( ! isEligible ) {
			return <IneligibleIndicator />;
		}

		return uptime ? `${ uptime }%` : <IneligibleIndicator />;
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function PHPVersion( { site }: { site: Site } ) {
	const isEligible = hasHostingFeature( site, HostingFeatures.PHP );
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const { data, isLoading } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	return <span ref={ ref }>{ ! isLoading ? data : <LoadingIndicator label="X.Y" /> }</span>;
}

export function MediaStorage( { site }: { site?: Site } ) {
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const { data: mediaStorage, isLoading } = useQuery( {
		...siteMediaStorageQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID && inView,
	} );

	const renderContent = () => {
		if ( ! site || isLoading ) {
			return <LoadingIndicator label="100%" />;
		}

		if ( ! mediaStorage ) {
			return <IneligibleIndicator />;
		}

		const { storage_used_bytes, max_storage_bytes } = mediaStorage;
		return `${ Math.round( ( storage_used_bytes / max_storage_bytes ) * 1000 ) / 10 }%`;
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

function SiteLaunchNag( { siteSlug }: { siteSlug: string } ) {
	const { recordTracksEvent } = useAnalytics();

	// TODO: We have to fix the obscured focus ring issue as the dataview's field value container
	// uses `overflow:hidden` to prevent any of the fields from overflowing.
	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_sites_site_launch_nag_impression" />
			<ExternalLink
				href={ wpcomLink( `/home/${ siteSlug }` ) }
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_sites_site_launch_nag_click' );
				} }
			>
				{ __( 'Finish setup' ) }
			</ExternalLink>
		</>
	);
}

function PlanRenewNag( { site, source }: { site: Pick< Site, 'slug' | 'plan' >; source: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const isTrial = isSitePlanTrial( site );

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_sites_plan_renew_nag_impression"
				properties={ { product_slug: site.plan?.product_slug, source } }
			/>
			<ExternalLink
				href={
					isTrial
						? wpcomLink( `/plans/${ site.slug }` )
						: wpcomLink( `/checkout/${ site.slug }/${ site.plan?.product_slug }` )
				}
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_sites_plan_renew_nag_click', {
						product_slug: site.plan?.product_slug,
						source,
					} );
				} }
			>
				{ isTrial ? __( 'Upgrade' ) : __( 'Renew plan' ) }
			</ExternalLink>
		</>
	);
}

export function Visibility( {
	siteSlug,
	visibility,
	status,
	isLaunched,
}: {
	siteSlug: string;
	visibility: SiteVisibility;
	status: SiteBlockingStatus;
	isLaunched?: boolean;
} ) {
	const visibilityLabels = getVisibilityLabels();
	return (
		<VStack spacing={ 1 }>
			<span>{ visibilityLabels[ visibility ] }</span>
			{ /* We don't want to show LaunchNag if there is any pending status. */ }
			{ ! status && ! isLaunched && <SiteLaunchNag siteSlug={ siteSlug } /> }
		</VStack>
	);
}

export function Plan( {
	nag,
	isSelfHostedJetpackConnected,
	isJetpack,
	isOwner,
	value,
}: {
	nag: { isExpired: false } | { isExpired: true; site: Pick< Site, 'slug' | 'plan' > };
	isSelfHostedJetpackConnected: boolean;
	isJetpack: boolean;
	isOwner?: boolean;
	value: string;
} ) {
	if ( isSelfHostedJetpackConnected ) {
		if ( ! isJetpack ) {
			return <IneligibleIndicator />;
		}
		return (
			<HStack spacing={ 1 } expanded={ false } justify="flex-start">
				<JetpackLogo size={ 16 } />
				<span>{ value }</span>
			</HStack>
		);
	}

	if ( nag.isExpired ) {
		return (
			<VStack spacing={ 1 }>
				<Text intent="error">
					{ sprintf(
						/* translators: %s: plan name */
						__( '%s-expired' ),
						value
					) }
				</Text>
				{ isOwner && <PlanRenewNag site={ nag.site } source="plan" /> }
			</VStack>
		);
	}

	return value;
}
