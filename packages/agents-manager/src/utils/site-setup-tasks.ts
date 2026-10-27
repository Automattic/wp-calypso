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

/** The `wpcom/start-site-setup-task` ability result: the status the task has after the write. */
export interface SiteSetupTaskStart {
	task_id: string;
	status: Extract< SiteSetupTaskStatus, 'in-progress' | 'done' >;
	summary: string;
}

const READ_ABILITY_NAME = 'wpcom/get-site-setup-tasks';
const START_ABILITY_NAME = 'wpcom/start-site-setup-task';

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
		path: addQueryArgs( `/wp-abilities/v1/abilities/${ READ_ABILITY_NAME }/run`, {
			input: { wpcom_site: siteId },
		} ),
	} );
}

/**
 * Runs the write ability through the Abilities REST API, a POST with the input
 * in the body, as `webmcp/server-ability-provider` does. The backend records
 * the task as started, or as done for a task that completes on click, exactly
 * as the Site Setup page's own "Get started" does.
 */
export function startSiteSetupTask(
	siteId: number,
	taskId: string
): Promise< SiteSetupTaskStart > {
	return apiFetch< SiteSetupTaskStart >( {
		method: 'POST',
		path: `/wp-abilities/v1/abilities/${ START_ABILITY_NAME }/run`,
		data: { input: { wpcom_site: siteId, task_id: taskId } },
	} );
}
