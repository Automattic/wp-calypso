import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import {
	siteLastBackupQuery,
	siteMediaStorageQuery,
	sitePHPVersionQuery,
	siteEngagementStatsQuery,
	siteUptimeQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
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
import { getStorageUsagePercent } from '../../utils/site-storage';
import { getVisibilityLabels } from '../../utils/site-visibility';
import { canManageSite } from '../features';
import { useAiLaunchpad } from '../hooks/use-ai-launchpad';
import SitePreview from '../site-preview';
import { PlanAwaitingCheckout, useSiteAwaitingCheckout } from './plan-awaiting-checkout';
import { PlanExpiryStatus } from './plan-expiry-status';
import { useIsSiteUnreachable } from './site-unreachable-status';
import type { SiteBadge, SiteBlockingStatus, SiteVisibility } from '../../types';
import type { Site, WowFunnelPendingSite } from '@automattic/api-core';
import type { ComponentProps } from 'react';

function IneligibleIndicator() {
	return <Text color="#CCCCCC">-</Text>;
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

export function SiteLink( {
	site,
	expanded,
	...props
}: ComponentProps< typeof Link > & { site: Site; expanded?: boolean } ) {
	return (
		<Link
			{ ...props }
			to={ getSiteManagementUrl( site ) }
			disabled={ site.is_deleted }
			style={ {
				width: expanded ? '100%' : 'auto',
				minWidth: 'unset',
				textDecoration: 'none',
				...props.style,
			} }
		/>
	);
}

export function Name( { site, value }: { site: Site; value: string } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isUnreachable = useIsSiteUnreachable( site, inView );

	return (
		<div ref={ ref }>
			<NameRenderer
				badges={ [ getSiteBadge( site ), isUnreachable ? 'unreachable' : null ] }
				muted={ site.is_deleted }
				value={ value }
			/>
		</div>
	);
}

export function NameRenderer( {
	badges,
	muted,
	value,
}: {
	badges: SiteBadge[];
	muted: boolean;
	value: string;
} ) {
	const renderBadge = ( badge: SiteBadge ) => {
		switch ( badge ) {
			case 'redirect':
				return <Badge intent="draft">{ __( 'Redirect' ) }</Badge>;
			case 'staging':
				return <Badge intent="draft">{ __( 'Staging' ) }</Badge>;
			case 'trial':
				return <Badge intent="draft">{ __( 'Trial' ) }</Badge>;
			case 'p2':
				return <Badge intent="draft">{ __( 'P2' ) }</Badge>;
			case 'deleted':
				return <Badge intent="high">{ __( 'Deleted' ) }</Badge>;
			case 'difm_lite_in_progress':
				return <Badge intent="draft">{ __( 'Express service' ) }</Badge>;
			case 'migration_pending':
				return <Badge intent="low">{ __( 'Migration pending' ) }</Badge>;
			case 'migration_started':
				return <Badge intent="informational">{ __( 'Migration started' ) }</Badge>;
			case 'unreachable':
				return <Badge intent="high">{ __( 'Unreachable' ) }</Badge>;
			default:
				return null;
		}
	};

	return (
		<HStack justify="flex-start" alignment="center" spacing={ 1 }>
			{ muted ? (
				<Text variant="muted">{ value }</Text>
			) : (
				<span style={ titleFieldTextOverflowStyles }>{ value }</span>
			) }
			{ badges.map(
				( badge ) =>
					badge && (
						<span key={ badge } style={ { flexShrink: 0 } }>
							{ renderBadge( badge ) }
						</span>
					)
			) }
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
			href={ site.URL }
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

	const isPending = ! site || isLoading;
	const renderContent = () => {
		if ( isPending ) {
			return '100';
		}

		if ( ! isEligible ) {
			return <IneligibleIndicator />;
		}

		return stats?.currentData[ type ];
	};

	return (
		<span ref={ ref }>
			<TextBlur isBlurred={ isPending }>{ renderContent() }</TextBlur>
		</span>
	);
}

export function EngagementStat( { value }: { value: number | null } ) {
	return typeof value !== 'number' ? <IneligibleIndicator /> : value;
}

export function LastBackup( { site }: { site?: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = site && hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE );

	const {
		data: lastBackup,
		isLoading,
		isError,
	} = useQuery( {
		...siteLastBackupQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID && isEligible && inView,
	} );

	const isPending = ! site || isLoading;
	const renderContent = () => {
		if ( isPending ) {
			return 'Unknown';
		}

		if ( ! isEligible ) {
			return <IneligibleIndicator />;
		}

		if ( ! lastBackup || isError ) {
			return <IneligibleIndicator />;
		}

		return <TimeSince timestamp={ lastBackup.published } />;
	};

	return (
		<span ref={ ref }>
			<TextBlur isBlurred={ isPending }>{ renderContent() }</TextBlur>
		</span>
	);
}

export function Uptime( { site }: { site?: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = site && hasJetpackModule( site, JetpackModules.MONITOR );

	const { data: uptime, isLoading } = useQuery( {
		...siteUptimeQuery( site?.ID ?? 0, 'week' ),
		enabled: !! site?.ID && isEligible && inView,
	} );

	const isPending = ! site || isLoading;
	const renderContent = () => {
		if ( isPending ) {
			return '100%';
		}

		if ( ! isEligible ) {
			return <IneligibleIndicator />;
		}

		return uptime ? `${ uptime }%` : <IneligibleIndicator />;
	};

	return (
		<span ref={ ref }>
			<TextBlur isBlurred={ isPending }>{ renderContent() }</TextBlur>
		</span>
	);
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

	return (
		<span ref={ ref }>
			<TextBlur isBlurred={ isLoading }>{ isLoading ? 'X.Y' : data }</TextBlur>
		</span>
	);
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

	const isPending = ! site || isLoading;
	const renderContent = () => {
		if ( isPending ) {
			return '100%';
		}

		if ( ! mediaStorage ) {
			return <IneligibleIndicator />;
		}

		return `${ getStorageUsagePercent( mediaStorage ) }%`;
	};

	return (
		<span ref={ ref }>
			<TextBlur isBlurred={ isPending }>{ renderContent() }</TextBlur>
		</span>
	);
}

function SiteLaunchNag( { siteSlug }: { siteSlug: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { isCompleted, isNoGuidance, setupUrl } = useAiLaunchpad( siteSlug );

	if ( isCompleted || isNoGuidance ) {
		return null;
	}

	const href = setupUrl ?? wpcomLink( `/home/${ siteSlug }` );

	// TODO: We have to fix the obscured focus ring issue as the dataview's field value container
	// uses `overflow:hidden` to prevent any of the fields from overflowing.
	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_sites_site_launch_nag_impression" />
			<ExternalLink
				href={ href }
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_sites_site_launch_nag_click' );
				} }
			>
				{ __( 'Finish setup' ) }
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

/**
 * The line under the plan name: where to finish buying a site held for checkout, or else how the
 * plan's expiry stands. One element at this level whichever it is, so the plan cell's own children
 * do not change when the held-site lookup answers.
 */
function PlanSubStatus( {
	site,
	awaitingCheckout,
}: {
	site: Site;
	awaitingCheckout: WowFunnelPendingSite | undefined;
} ) {
	if ( awaitingCheckout ) {
		return <PlanAwaitingCheckout pending={ awaitingCheckout } />;
	}

	return <PlanExpiryStatus site={ site } />;
}

export function Plan( {
	site,
	isSelfHostedJetpackConnected,
	isJetpack,
	value,
}: {
	site: Site;
	isSelfHostedJetpackConnected: boolean;
	isJetpack: boolean;
	value: string;
} ) {
	const awaitingCheckout = useSiteAwaitingCheckout( site );

	if ( isSelfHostedJetpackConnected ) {
		if ( ! isJetpack ) {
			return <IneligibleIndicator />;
		}
		return <span>{ value }</span>;
	}

	return (
		<VStack spacing={ 1 }>
			{ /* The same span either way, with only its text changing: the answer arrives after
			     first paint, and swapping elements across that boundary crashes under Google
			     Translate (react/react#11538). */ }
			<span>{ awaitingCheckout ? __( 'Awaiting checkout' ) : value }</span>
			<PlanSubStatus site={ site } awaitingCheckout={ awaitingCheckout } />
		</VStack>
	);
}
