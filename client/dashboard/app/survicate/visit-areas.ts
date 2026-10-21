/**
 * Registry of dashboard areas whose visit counts are published to Survicate as
 * visitor traits, so surveys can target users who have visited an area at least
 * X times. The "≥ X" threshold is configured per survey in the Survicate
 * dashboard, not here.
 *
 * To track a new area: add an entry here and a matching case in
 * `resolveVisitAreaSlug` below. Counting is route-driven via
 * `useTrackVisitedAreas`; no per-route wiring is needed.
 */

export interface VisitArea {
	/** Suffix of the `hosting-dashboard-visit-count-<slug>` preference key. */
	slug: string;
	/** Survicate visitor trait that receives the area's visit count. */
	trait: string;
}

export const VISIT_AREAS: VisitArea[] = [
	{ slug: 'sites-list', trait: 'msd_visits_sites_list' },
	{ slug: 'site-overview', trait: 'msd_visits_site_overview' },
	{ slug: 'deployments', trait: 'msd_visits_deployments' },
	{ slug: 'logs-monitoring', trait: 'msd_visits_logs_monitoring' },
	{ slug: 'backups-activity', trait: 'msd_visits_backups_activity' },
	{ slug: 'performance', trait: 'msd_visits_performance' },
	{ slug: 'server-config', trait: 'msd_visits_server_config' },
	{ slug: 'domains', trait: 'msd_visits_domains' },
	{ slug: 'emails', trait: 'msd_visits_emails' },
	{ slug: 'account', trait: 'msd_visits_account' },
];

// Site-settings children counted as the "server-config" (hosting config) area.
const SERVER_CONFIG_SETTINGS = new Set( [ 'sftp-ssh', 'php', 'database', 'caching' ] );

/**
 * Maps a dashboard pathname to the visit-area slug it belongs to, or `null` if
 * the pathname is not a tracked area. Resolution is by the deepest meaningful
 * path segment, so overlapping routes (e.g. `logs/activity` sitting under the
 * logs route) resolve to the most specific area.
 *
 * `pathname` is the router's `location.pathname`, which includes the entry
 * point's `basePath` — strip it so matching is relative to the app root.
 */
export function resolveVisitAreaSlug( pathname: string, basePath = '' ): string | null {
	const parts = pathname.split( '/' ).filter( Boolean );
	const baseParts = basePath.split( '/' ).filter( Boolean );
	if ( baseParts.every( ( segment, i ) => parts[ i ] === segment ) ) {
		parts.splice( 0, baseParts.length );
	}

	if ( parts[ 0 ] === 'sites' ) {
		if ( parts.length === 1 ) {
			return 'sites-list';
		}
		if ( parts.length === 2 ) {
			return 'site-overview';
		}
		switch ( parts[ 2 ] ) {
			case 'deployments':
				return 'deployments';
			case 'monitoring':
				return 'logs-monitoring';
			case 'logs':
				return parts[ 3 ] === 'activity' ? 'backups-activity' : 'logs-monitoring';
			case 'backups':
				return 'backups-activity';
			case 'performance':
				return 'performance';
			case 'settings':
				return SERVER_CONFIG_SETTINGS.has( parts[ 3 ] ) ? 'server-config' : null;
			default:
				return null;
		}
	}

	if ( parts[ 0 ] === 'domains' ) {
		return 'domains';
	}
	if ( parts[ 0 ] === 'emails' ) {
		return 'emails';
	}
	if ( parts[ 0 ] === 'me' ) {
		return 'account';
	}

	return null;
}
