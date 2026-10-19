import { AGENCY_SITE_ISSUES } from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Text } from '../../../components/text';
import type { AgencySite, AgencySiteIssue } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

// The monitor reports a site as down until its first check, and stamps the
// first status change with the Unix epoch, so that alone doesn't mean down.
const MONITOR_NEVER_CHANGED = '1970-01-01 00:00:00';

interface SiteIssue {
	label: string;
	intent: 'high' | 'medium';
}

function getIssueLabels(): Record< AgencySiteIssue, string > {
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

function isAgencySiteIssue( value: unknown ): value is AgencySiteIssue {
	return AGENCY_SITE_ISSUES.some( ( issue ) => issue === value );
}

function isSiteDown( site: AgencySite ): boolean {
	const monitor = site.monitor_settings;
	return (
		!! monitor?.monitor_active &&
		! monitor.monitor_site_status &&
		site.monitor_last_status_change !== MONITOR_NEVER_CHANGED
	);
}

// Mirrors how the classic sites dashboard reads the same endpoint fields.
export function getSiteIssues( site: AgencySite ): SiteIssue[] {
	const labels = getIssueLabels();
	const issues: SiteIssue[] = [];
	const backupStatus = site.has_backup ? ( site.latest_backup_status ?? '' ) : '';
	const threats = site.has_scan ? ( site.latest_scan_threats_found?.length ?? 0 ) : 0;
	const pluginUpdates = site.awaiting_plugin_updates?.length ?? 0;

	if ( isSiteDown( site ) ) {
		issues.push( { label: labels.site_down, intent: 'high' } );
	}
	if ( site.is_connection_healthy === false ) {
		issues.push( { label: labels.site_disconnected, intent: 'high' } );
	}
	if ( backupStatus.endsWith( '_error' ) ) {
		issues.push( { label: labels.backup_failed, intent: 'high' } );
	}
	if ( threats > 0 ) {
		issues.push( {
			label: sprintf(
				/* translators: %s: number of security threats found on the site */
				_n( '%s threat', '%s threats', threats ),
				formatNumber( threats )
			),
			intent: 'high',
		} );
	}
	if ( backupStatus.endsWith( '_warning' ) ) {
		issues.push( { label: labels.backup_warning, intent: 'medium' } );
	}
	if ( pluginUpdates > 0 ) {
		issues.push( {
			label: sprintf(
				/* translators: %s: number of plugins with an update available */
				_n( '%s plugin update', '%s plugin updates', pluginUpdates ),
				formatNumber( pluginUpdates )
			),
			intent: 'medium',
		} );
	}

	return issues;
}

// The filter is applied by the endpoint; the column reads the issues off each site.
export function getStatusField(): Field< AgencySite > {
	const labels = getIssueLabels();

	return {
		id: 'status',
		label: __( 'Status' ),
		type: 'text',
		elements: AGENCY_SITE_ISSUES.map( ( value ) => ( { value, label: labels[ value ] } ) ),
		filterBy: { operators: [ 'is' ], isPrimary: true },
		getValue: ( { item } ) =>
			getSiteIssues( item )
				.map( ( issue ) => issue.label )
				.join( ', ' ),
		render: ( { item } ) => {
			const issues = getSiteIssues( item );
			if ( ! issues.length ) {
				return <Text variant="muted">-</Text>;
			}
			return (
				<HStack justify="flex-start" spacing={ 1 } wrap expanded={ false }>
					{ issues.map( ( issue ) => (
						<Badge key={ issue.label } intent={ issue.intent }>
							{ issue.label }
						</Badge>
					) ) }
				</HStack>
			);
		},
		enableSorting: false,
	};
}

export function getStatusFilter( view: View ): AgencySiteIssue | undefined {
	const value = view.filters?.find( ( filter ) => filter.field === 'status' )?.value;
	return isAgencySiteIssue( value ) ? value : undefined;
}
