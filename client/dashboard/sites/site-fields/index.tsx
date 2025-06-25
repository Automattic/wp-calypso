import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useInView } from 'react-intersection-observer';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { siteBackupLastEntryQuery } from '../../app/queries/site-backups';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { sitePHPVersionQuery } from '../../app/queries/site-php-version';
import { siteEngagementStatsQuery } from '../../app/queries/site-stats';
import { siteUptimeQuery } from '../../app/queries/site-uptime';
import ComponentViewTracker from '../../components/component-view-tracker';
import { TextBlur } from '../../components/text-blur';
import TimeSince from '../../components/time-since';
import { JetpackModules } from '../../data/constants';
import { hasAtomicFeature, hasJetpackModule } from '../../utils/site-features';
import { getSiteStatusLabel } from '../../utils/site-status';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { HostingFeatures } from '../features';
import { isSitePlanTrial } from '../plans';
import type { Site } from '../../data/types';

function IneligibleIndicator() {
	return <Text color="#CCCCCC">-</Text>;
}

function LoadingIndicator( { label }: { label: string } ) {
	return <TextBlur>{ label }</TextBlur>;
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

export function Status( { site }: { site: Site } ) {
	if ( site.is_deleted ) {
		return <Text isDestructive>{ __( 'Deleted' ) }</Text>;
	}

	if ( site.plan?.expired ) {
		return (
			<VStack spacing={ 1 }>
				<Text isDestructive>{ __( 'Plan expired' ) }</Text>
				<PlanRenewNag site={ site } source="status" />
			</VStack>
		);
	}

	if ( site.launch_status === 'unlaunched' ) {
		return <SiteLaunchNag site={ site } />;
	}

	return getSiteStatusLabel( site );
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
			<HStack spacing={ 1 } expanded={ false }>
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
