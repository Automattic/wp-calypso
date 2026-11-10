import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';

export type SiteSetupTaskStatus = 'todo' | 'in-progress' | 'done' | 'skipped';

export interface SiteSetupTask {
	id: string;
	title: string;
	subtitle?: string;
	status: SiteSetupTaskStatus;
	disabled: boolean;
	url?: string;
}

/** The `wpcom/get-site-setup-tasks` ability result. `eligible: false` comes with no tasks. */
export interface SiteSetupTasks {
	eligible: boolean;
	tasks: SiteSetupTask[];
	progress: { completed: number; total: number };
	summary: string;
}

const ABILITY_NAME = 'wpcom/get-site-setup-tasks';

/** The site named by the wp-admin payload; the ability needs it outside an agent turn. */
export function getSiteSetupSiteId(): number | null {
	const siteId = getAgentsManagerInlineData()?.site?.ID;
	return typeof siteId === 'number' && siteId > 0 ? siteId : null;
}

/**
 * Runs the read-only backend ability through the Abilities REST API: a GET
 * with the input in the query, as `webmcp/server-ability-provider` does. On
 * Simple sites `apiFetch` reaches it through the public API, on Atomic through
 * the site's own REST API.
 */
export function fetchSiteSetupTasks( siteId: number ): Promise< SiteSetupTasks > {
	return apiFetch< SiteSetupTasks >( {
		method: 'GET',
		path: addQueryArgs( `/wp-abilities/v1/abilities/${ ABILITY_NAME }/run`, {
			input: { wpcom_site: siteId },
		} ),
	} );
}
