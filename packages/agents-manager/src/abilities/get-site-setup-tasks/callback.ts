import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
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

// `calypso_path` is either an absolute URL (wp-admin, Stripe) or a path on
// wordpress.com. The Site Setup page can follow the path as-is because it runs
// on that origin; this ability also runs on Atomic, so it resolves it first.
const CALYPSO_ORIGIN = 'https://wordpress.com';

function toTaskUrl( value: unknown ): string | undefined {
	if ( typeof value !== 'string' || ! value ) {
		return undefined;
	}
	if ( /^https?:\/\//.test( value ) ) {
		return value;
	}
	return value.startsWith( '/' ) ? `${ CALYPSO_ORIGIN }${ value }` : undefined;
}

// The endpoint answers 404 `ai_launchpad_not_eligible` for a site without a list.
function isNotEligibleError( error: unknown ): boolean {
	return (
		!! error &&
		typeof error === 'object' &&
		( error as { code?: unknown } ).code === NOT_ELIGIBLE_CODE
	);
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
			...( ( url ) => url && { url } )( toTaskUrl( task.calypso_path ) ),
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

	// The site's own REST route, as the Site Setup page reads it. The ability only
	// runs in the editor for now; a Calypso chat would need the public API with the
	// session's site id instead.
	try {
		response = await apiFetch< AiLaunchpadResponse >( { path: '/wpcom/v2/ai-launchpad' } );
	} catch ( error ) {
		if ( isNotEligibleError( error ) ) {
			return notEligibleResult();
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
