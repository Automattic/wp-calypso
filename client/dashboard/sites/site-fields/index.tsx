import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { useInView } from 'react-intersection-observer';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { siteLatestAtomicTransferQuery } from '../../app/queries/site-atomic-transfers';
import { siteBackupLastEntryQuery } from '../../app/queries/site-backups';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { sitePHPVersionQuery } from '../../app/queries/site-php-version';
import { siteEngagementStatsQuery } from '../../app/queries/site-stats';
import { siteUptimeQuery } from '../../app/queries/site-uptime';
import ComponentViewTracker from '../../components/component-view-tracker';
import { TextBlur } from '../../components/text-blur';
import TimeSince from '../../components/time-since';
import { DotcomFeatures, JetpackModules } from '../../data/constants';
import { isAtomicTransferInProgress } from '../../utils/site-atomic-transfers';
import { hasAtomicFeature, hasJetpackModule, hasPlanFeature } from '../../utils/site-features';
import { getSiteStatus, getSiteStatusLabel } from '../../utils/site-status';
import { isSelfHostedJetpackConnected, isP2 } from '../../utils/site-types';
import { HostingFeatures, canManageSite } from '../features';
import { isSitePlanTrial } from '../plans';
import SiteIcon from '../site-icon';
import SitePreview from '../site-preview';
import { JetpackLogo } from './jetpack-logo';
import type { AtomicTransferStatus, Site } from '../../data/types';

function IneligibleIndicator() {
	return <Text color="#CCCCCC">-</Text>;
}

function LoadingIndicator( { label }: { label: string } ) {
	return <TextBlur>{ label }</TextBlur>;
}

function getSiteManagementUrl( site: Site ) {
	if ( canManageSite( site ) ) {
		return `/sites/${ site.slug }`;
	}
	return site.options?.admin_url;
}

const titleFieldTextOverflowStyles = {
	overflowX: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

export function Name( { site, value }: { site: Site; value: string } ) {
	const renderBadge = () => {
		if ( site.is_wpcom_staging_site ) {
			return <Badge>{ __( 'Staging' ) }</Badge>;
		}

		if ( isSitePlanTrial( site ) ) {
			return <Badge>{ __( 'Trial' ) }</Badge>;
		}

		if ( isP2( site ) ) {
			return <Badge>{ __( 'P2' ) }</Badge>;
		}

		return null;
	};

	return (
		<Link to={ getSiteManagementUrl( site ) } disabled={ site.is_deleted }>
			<HStack alignment="center" spacing={ 1 }>
				{ site.is_deleted ? (
					<Text variant="muted">{ value }</Text>
				) : (
					<span style={ titleFieldTextOverflowStyles }>{ value }</span>
				) }
				<span style={ { flexShrink: 0 } }>{ renderBadge() }</span>
			</HStack>
		</Link>
	);
}

export function URL( { site, value }: { site: Site; value: string } ) {
	return site.is_deleted ? (
		<Text variant="muted">{ value }</Text>
	) : (
		<span style={ titleFieldTextOverflowStyles }>{ value }</span>
	);
}

export function SiteIconLink( { site }: { site: Site } ) {
	return (
		<Link
			to={ getSiteManagementUrl( site ) }
			disabled={ site.is_deleted }
			style={ { textDecoration: 'none' } }
		>
			<SiteIcon site={ site } />
		</Link>
	);
}

export function Preview( { site }: { site: Site } ) {
	const [ resizeListener, { width } ] = useResizeObserver();
	const { is_deleted, is_private, URL: url } = site;
	// If the site is a private A8C site, X-Frame-Options is set to same
	// origin.
	const iframeDisabled = is_deleted || ( site.is_a8c && is_private );
	return (
		<Link
			to={ getSiteManagementUrl( site ) }
			disabled={ site.is_deleted }
			style={ { display: 'block', height: '100%', width: '100%' } }
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
		</Link>
	);
}

export function EngagementStat( {
	site,
	type,
}: {
	site: Site;
	type: 'visitors' | 'views' | 'likes';
} ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible =
		! site.is_deleted && ( ! site.jetpack || hasJetpackModule( site, JetpackModules.STATS ) );

	const { data: stats, isLoading } = useQuery( {
		...siteEngagementStatsQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <LoadingIndicator label="100" />;
		}

		return stats?.currentData[ type ];
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function LastBackup( { site }: { site: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = hasAtomicFeature( site, HostingFeatures.BACKUPS );

	const {
		data: lastBackup,
		isLoading,
		isError,
	} = useQuery( {
		...siteBackupLastEntryQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <LoadingIndicator label="Unknown" />;
		}

		if ( ! lastBackup || isError ) {
			return <IneligibleIndicator />;
		}

		return <TimeSince date={ lastBackup.last_updated } />;
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function Uptime( { site }: { site: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = hasJetpackModule( site, JetpackModules.MONITOR );

	const { data: uptime, isLoading } = useQuery( {
		...siteUptimeQuery( site.ID, 'week' ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <LoadingIndicator label="100%" />;
		}

		return uptime ? `${ uptime }%` : <IneligibleIndicator />;
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function PHPVersion( { site }: { site: Site } ) {
	const isEligible = hasAtomicFeature( site, HostingFeatures.PHP );
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

export function MediaStorage( { site }: { site: Site } ) {
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const { data: mediaStorage, isLoading } = useQuery( {
		...siteMediaStorageQuery( site.ID ),
		enabled: inView,
	} );

	const value = mediaStorage ? (
		`${
			Math.round( ( mediaStorage.storageUsedBytes / mediaStorage.maxStorageBytes ) * 1000 ) / 10
		}%`
	) : (
		<IneligibleIndicator />
	);

	return <span ref={ ref }>{ ! isLoading ? value : <LoadingIndicator label="100%" /> }</span>;
}

function SiteLaunchNag( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();

	// TODO: We have to fix the obscured focus ring issue as the dataview's field value container
	// uses `overflow:hidden` to prevent any of the fields from overflowing.
	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_sites_site_launch_nag_impression" />
			<ExternalLink
				href={ `/home/${ site.slug }` }
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_sites_site_launch_nag_click' );
				} }
			>
				{ getSiteStatusLabel( site ) }
			</ExternalLink>
		</>
	);
}

function PlanRenewNag( { site, source }: { site: Site; source: string } ) {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();

	if ( site.site_owner !== user.ID ) {
		return null;
	}

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
						? `/plans/${ site.slug }`
						: `/checkout/${ site.slug }/${ site.plan?.product_slug }`
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

function WithHostingFeaturesQuery( {
	site,
	children,
}: {
	site: Site;
	children: ( transferStatus?: AtomicTransferStatus ) => React.ReactNode;
} ) {
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const { data } = useQuery( {
		...siteLatestAtomicTransferQuery( site.ID ),
		enabled: inView,
	} );

	return <span ref={ ref }>{ children( data?.status ) }</span>;
}

export function Status( { site }: { site: Site } ) {
	const status = getSiteStatus( site );
	const label = getSiteStatusLabel( site );

	if ( status === 'deleted' ) {
		return <Text isDestructive>{ label }</Text>;
	}

	if ( status === 'difm_lite_in_progress' ) {
		return <Badge>{ label }</Badge>;
	}

	if ( status === 'migration_pending' ) {
		return <Badge intent="warning">{ label }</Badge>;
	}

	if ( status === 'migration_started' ) {
		return <Badge intent="info">{ label }</Badge>;
	}

	if ( site.plan?.expired ) {
		return (
			<VStack spacing={ 1 }>
				<Text isDestructive>{ __( 'Plan expired' ) }</Text>
				<PlanRenewNag site={ site } source="status" />
			</VStack>
		);
	}

	const renderBasicStatus = () => {
		if ( site.launch_status === 'unlaunched' ) {
			return <SiteLaunchNag site={ site } />;
		}
		return label;
	};

	if ( hasPlanFeature( site, DotcomFeatures.ATOMIC ) && ! site.is_wpcom_atomic ) {
		return (
			<WithHostingFeaturesQuery site={ site }>
				{ ( transferStatus ) => {
					if ( transferStatus ) {
						if ( transferStatus === 'error' ) {
							return __( 'Error activating hosting features' );
						}
						if ( isAtomicTransferInProgress( transferStatus ) ) {
							return __( 'Activating hosting features…' );
						}
					}
					return renderBasicStatus();
				} }
			</WithHostingFeaturesQuery>
		);
	}

	return renderBasicStatus();
}

export function Plan( { site }: { site: Site } ) {
	if ( site.is_wpcom_staging_site ) {
		// translator: this is the label of a staging site.
		return __( 'Staging' );
	}

	if ( isSelfHostedJetpackConnected( site ) ) {
		if ( ! site.jetpack ) {
			return <IneligibleIndicator />;
		}
		return (
			<HStack spacing={ 1 } expanded={ false } justify="flex-start">
				<JetpackLogo size={ 16 } />
				<span>{ site.plan?.product_name_short }</span>
			</HStack>
		);
	}

	if ( site.plan?.expired ) {
		return (
			<VStack spacing={ 1 }>
				<Text isDestructive>
					{ sprintf(
						/* translators: %s: plan name */
						__( '%s-expired' ),
						site.plan?.product_name_short
					) }
				</Text>
				<PlanRenewNag site={ site } source="plan" />
			</VStack>
		);
	}

	return site.plan?.product_name_short;
}
