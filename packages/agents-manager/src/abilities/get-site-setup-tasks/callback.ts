import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { getSessionSiteKey, NO_SITE } from '../../utils/agent-session';
import { getAgentsManagerInlineData } from '../../utils/get-agents-manager-inline-data';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

export type SiteSetupTaskStatus = 'todo' | 'in-progress' | 'done' | 'skipped';

export interface SiteSetupTask {
	id: string;
	title: string;
	subtitle?: string;
	status: SiteSetupTaskStatus;
	disabled: boolean;
	url?: string;
}

export interface SiteSetupDetails extends Record< string, unknown > {
	eligible: boolean;
	tasks: SiteSetupTask[];
	progress: { completed: number; total: number };
}

// The `wpcom/v2/ai-launchpad` response, as far as this ability reads it.
interface AiLaunchpadResponse {
	tasks?: Array< {
		id?: unknown;
		title?: unknown;
		subtitle?: unknown;
		completed?: unknown;
		skipped?: unknown;
		in_progress?: unknown;
		disabled?: unknown;
		calypso_path?: unknown;
	} >;
	dismissed?: unknown;
	is_eligible?: unknown;
}

const NOT_ELIGIBLE_CODE = 'ai_launchpad_not_eligible';

/**
 * The site the chat is scoped to: the wp-admin inline payload on Simple and
 * Atomic, the published session scope in Calypso. `null` when the chat has
 * no selected site (Calypso screens that are not site-specific).
 */
function resolveSiteId(): number | null {
	const inlineSiteId = getAgentsManagerInlineData()?.site?.ID;

	if ( typeof inlineSiteId === 'number' && inlineSiteId > 0 ) {
		return inlineSiteId;
	}

	const siteKey = getSessionSiteKey();

	if ( siteKey === NO_SITE ) {
		return null;
	}

	const siteId = Number( siteKey );

	return Number.isInteger( siteId ) && siteId > 0 ? siteId : null;
}

// wordpress.com origins reach the public API through the proxy; a wp-admin
// off wordpress.com (Atomic, Jetpack) only has the site's own REST route.
async function fetchSiteSetup(): Promise< AiLaunchpadResponse > {
	if ( ! canAccessWpcomApis() ) {
		return apiFetch< AiLaunchpadResponse >( { path: '/wpcom/v2/ai-launchpad' } );
	}

	const siteId = resolveSiteId();

	if ( siteId === null ) {
		throw new Error( 'no_site' );
	}

	return wpcomRequest< AiLaunchpadResponse >( {
		path: `/sites/${ siteId }/ai-launchpad`,
		apiNamespace: 'wpcom/v2',
	} );
}

// The endpoint answers 404 `ai_launchpad_not_eligible` for a site without a
// list. `wpcom-proxy-request` surfaces it as `error`, `@wordpress/api-fetch`
// as `code`.
function isNotEligibleError( error: unknown ): boolean {
	if ( ! error || typeof error !== 'object' ) {
		return false;
	}

	const { code, error: errorCode } = error as { code?: unknown; error?: unknown };

	return code === NOT_ELIGIBLE_CODE || errorCode === NOT_ELIGIBLE_CODE;
}

function toStatus(
	task: NonNullable< AiLaunchpadResponse[ 'tasks' ] >[ number ]
): SiteSetupTaskStatus {
	if ( task.skipped === true ) {
		return 'skipped';
	}

	if ( task.completed === true ) {
		return 'done';
	}

	if ( task.in_progress === true ) {
		return 'in-progress';
	}

	return 'todo';
}

function toTasks( response: AiLaunchpadResponse ): SiteSetupTask[] {
	const tasks = Array.isArray( response.tasks ) ? response.tasks : [];
	const mapped: SiteSetupTask[] = [];

	for ( const task of tasks ) {
		if ( typeof task?.id !== 'string' || ! task.id ) {
			continue;
		}

		mapped.push( {
			id: task.id,
			title: typeof task.title === 'string' ? task.title : task.id,
			...( typeof task.subtitle === 'string' && task.subtitle && { subtitle: task.subtitle } ),
			status: toStatus( task ),
			disabled: task.disabled === true,
			...( typeof task.calypso_path === 'string' &&
				task.calypso_path && { url: task.calypso_path } ),
		} );
	}

	return mapped;
}

function notEligibleResult(): AbilityResult {
	const details: SiteSetupDetails = {
		eligible: false,
		tasks: [],
		progress: { completed: 0, total: 0 },
	};

	return successResult( __( 'This site has no setup task list.', __i18n_text_domain__ ), details );
}

/**
 * The `get-site-setup-tasks` ability callback: reads the Site Setup list and
 * returns every task with its status, plus the overall progress. Read-only.
 */
export async function getSiteSetupTasksCallback(): Promise< AbilityResult > {
	let response: AiLaunchpadResponse;

	try {
		response = await fetchSiteSetup();
	} catch ( error ) {
		if ( isNotEligibleError( error ) ) {
			return notEligibleResult();
		}

		if ( error instanceof Error && error.message === 'no_site' ) {
			return errorResult(
				'No site is selected in this chat, so there is no setup list to read.',
				__( 'Select a site to see its setup tasks.', __i18n_text_domain__ )
			);
		}

		return errorResult(
			error instanceof Error ? error.message : 'Failed to read the setup tasks.'
		);
	}

	if ( response.is_eligible === false || response.dismissed === true ) {
		return notEligibleResult();
	}

	const tasks = toTasks( response );

	const completed = tasks.filter(
		( task ) => task.status !== 'todo' && task.status !== 'in-progress'
	).length;

	const details: SiteSetupDetails = {
		eligible: true,
		tasks,
		progress: { completed, total: tasks.length },
	};

	const message = sprintf(
		/* translators: %1$d: completed tasks, %2$d: total tasks */
		_n(
			'%1$d of %2$d setup task done.',
			'%1$d of %2$d setup tasks done.',
			tasks.length,
			__i18n_text_domain__
		),
		completed,
		tasks.length
	);

	return successResult( message, details );
}
