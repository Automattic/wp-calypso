// The issues `/me/sites` and `/jetpack-agency/sites` filter by. `all_issues` matches a site with any of them.
export const SITE_ISSUES = [
	'all_issues',
	'backup_failed',
	'backup_warning',
	'threats_found',
	'site_disconnected',
	'site_down',
	'plugin_updates',
] as const;

export type SiteIssue = ( typeof SITE_ISSUES )[ number ];

export interface SiteHealth {
	site_down: boolean;
	site_disconnected: boolean;
	backup_failed: boolean;
	backup_warning: boolean;
	// Null when the site-profiles index couldn't be queried, so it isn't mistaken for a clean scan.
	threats_found: number | null;
	plugin_updates: number;
}
