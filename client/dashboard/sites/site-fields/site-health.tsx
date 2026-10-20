import { SITE_ISSUES } from '@automattic/api-core';
import { siteHealthQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useInView } from 'react-intersection-observer';
import { Text } from '../../components/text';
import { TextBlur } from '../../components/text-blur';
import type { Site, SiteHealth as SiteHealthData, SiteIssue } from '@automattic/api-core';

interface SiteIssueBadge {
	label: string;
	intent: 'high' | 'medium';
}

export function getSiteIssueLabels(): Record< SiteIssue, string > {
	return {
		all_issues: __( 'Needs attention' ),
		backup_failed: __( 'Backup failed' ),
		backup_warning: __( 'Backup warning' ),
		threats_found: __( 'Threat found' ),
		site_disconnected: __( 'Site disconnected' ),
		site_down: __( 'Site down' ),
		plugin_updates: __( 'Plugins needing updates' ),
	};
}

export function isSiteIssue( value: unknown ): value is SiteIssue {
	return SITE_ISSUES.some( ( issue ) => issue === value );
}

function getSiteIssueBadges( health: SiteHealthData ): SiteIssueBadge[] {
	const labels = getSiteIssueLabels();
	const badges: SiteIssueBadge[] = [];
	const threats = health.threats_found ?? 0;

	if ( health.site_down ) {
		badges.push( { label: labels.site_down, intent: 'high' } );
	}
	if ( health.site_disconnected ) {
		badges.push( { label: labels.site_disconnected, intent: 'high' } );
	}
	if ( health.backup_failed ) {
		badges.push( { label: labels.backup_failed, intent: 'high' } );
	}
	if ( threats > 0 ) {
		badges.push( {
			label: sprintf(
				/* translators: %s: number of security threats found on the site */
				_n( '%s threat', '%s threats', threats ),
				formatNumber( threats )
			),
			intent: 'high',
		} );
	}
	if ( health.backup_warning ) {
		badges.push( { label: labels.backup_warning, intent: 'medium' } );
	}
	if ( health.plugin_updates > 0 ) {
		badges.push( {
			label: sprintf(
				/* translators: %s: number of plugins with an update available */
				_n( '%s plugin update', '%s plugin updates', health.plugin_updates ),
				formatNumber( health.plugin_updates )
			),
			intent: 'medium',
		} );
	}

	return badges;
}

// Only Jetpack-connected sites, Atomic included, can have an issue. A site
// connected without the Jetpack plugin has `jetpack: false` but still counts.
export function SiteHealth( { site }: { site: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = site.jetpack || site.jetpack_connection;

	const { data: health, isLoading } = useQuery( {
		...siteHealthQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	const badges = health ? getSiteIssueBadges( health ) : [];

	return (
		<span ref={ ref }>
			{ badges.length ? (
				<HStack justify="flex-start" spacing={ 1 } wrap expanded={ false }>
					{ badges.map( ( badge ) => (
						<Badge key={ badge.label } intent={ badge.intent }>
							{ badge.label }
						</Badge>
					) ) }
				</HStack>
			) : (
				<TextBlur isBlurred={ isLoading }>
					<Text variant="muted">-</Text>
				</TextBlur>
			) }
		</span>
	);
}
