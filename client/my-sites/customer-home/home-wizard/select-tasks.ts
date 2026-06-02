import { TASK_REGISTRY } from './task-registry';
import type { SiteState, TaskCategory, TaskTemplate } from './task-registry';
import type { FeatureKey, GoalKey } from './types';

export type SelectedTask = TaskTemplate & {
	completed: boolean;
	resolvedUrl: string;
};

const CATEGORY_ORDER: Record< TaskCategory, number > = {
	activation: 0,
	'feature-setup': 1,
	discover: 2,
	growth: 3,
};

const MIN_TASKS = 5;
const VISIBLE_TASK_LIMIT = 6;

function matchesGoal( template: TaskTemplate, goal: GoalKey | null ): boolean {
	if ( ! template.goals ) {
		return false;
	}
	if ( ! goal ) {
		return false;
	}
	return template.goals.includes( goal );
}

function matchesFeature( template: TaskTemplate, features: FeatureKey[] ): boolean {
	if ( ! template.features ) {
		return false;
	}
	return template.features.some( ( f ) => features.includes( f ) );
}

function isTemplateEligible(
	template: TaskTemplate,
	goal: GoalKey | null,
	features: FeatureKey[]
): boolean {
	// A template is eligible if either the goal matches OR a feature matches.
	// (Universal/growth templates declare all goals so they always match.)
	return matchesGoal( template, goal ) || matchesFeature( template, features );
}

function isCompleted( template: TaskTemplate, site: SiteState ): boolean {
	switch ( template.completesOn ) {
		case 'first_published_post':
			return site.postCount > 0;
		case 'first_product':
			return site.hasProduct;
		case 'first_subscriber':
			return site.subscriberCount > 0;
		case 'custom_domain_connected':
			return site.hasCustomDomain;
		case 'site_launched':
			return site.isLaunched;
		default:
			return false;
	}
}

function shouldHide( template: TaskTemplate, site: SiteState ): boolean {
	const hide = template.hideWhen;
	if ( ! hide ) {
		return false;
	}
	if ( hide.hasPosts && site.postCount > 0 ) {
		return true;
	}
	if ( hide.hasPages && site.pageCount > 0 ) {
		return true;
	}
	if ( hide.hasSubscribers && site.subscriberCount > 0 ) {
		return true;
	}
	if ( hide.hasCustomDomain && site.hasCustomDomain ) {
		return true;
	}
	if ( hide.isLaunched && site.isLaunched ) {
		return true;
	}
	if ( hide.isLaunched === false && ! site.isLaunched ) {
		return true;
	}
	if ( hide.hasProduct && site.hasProduct ) {
		return true;
	}
	if ( hide.pluginInstalled && site.installedPluginSlugs.includes( hide.pluginInstalled ) ) {
		return true;
	}
	return false;
}

function sortTasks( tasks: { template: TaskTemplate; registryIndex: number }[] ) {
	return [ ...tasks ].sort( ( a, b ) => {
		// Launch is always last, regardless of category.
		const aLaunch = a.template.id === 'launch-site' ? 1 : 0;
		const bLaunch = b.template.id === 'launch-site' ? 1 : 0;
		if ( aLaunch !== bLaunch ) {
			return aLaunch - bLaunch;
		}
		const c = CATEGORY_ORDER[ a.template.category ] - CATEGORY_ORDER[ b.template.category ];
		if ( c !== 0 ) {
			return c;
		}
		return a.registryIndex - b.registryIndex;
	} );
}

/**
 * Pick and order the tasks shown in the tailored Site Setup widget.
 *
 * Order: activation → feature-setup → discover → growth → launch.
 * Within a category we keep registry order (so we can hand-tune priority
 * by editing the array).
 *
 * Always returns at least MIN_TASKS items: starts from the strict
 * Goal/Features eligibility, suppresses growth-before-activation, then
 * tops up from the broader registry (universal goal-tagged tasks first,
 * then any remaining template) until the minimum is met. Capped at
 * VISIBLE_TASK_LIMIT to avoid overwhelming the widget.
 */
export function selectTasks(
	goal: GoalKey | null,
	features: FeatureKey[],
	site: SiteState
): SelectedTask[] {
	// Keep completed tasks visible so they render as struck-through "done"
	// rows instead of vanishing. `hideWhen` and `completesOn` often key off the
	// same signal (e.g. publish-first-post hides on hasPosts AND completes on
	// first_published_post) — completion should win and show the done state.
	const visibleTemplates = TASK_REGISTRY.filter(
		( t ) => isCompleted( t, site ) || ! shouldHide( t, site )
	);

	const primary = visibleTemplates.filter( ( t ) => isTemplateEligible( t, goal, features ) );

	const hasActivated = primary.some(
		( t ) => t.category === 'activation' && isCompleted( t, site )
	);

	let primaryFiltered = primary.filter( ( t ) => {
		if ( t.category === 'growth' && ! hasActivated ) {
			return false;
		}
		return true;
	} );

	// Top-up pass: if eligibility-matched tasks don't reach MIN_TASKS, add
	// any other non-hidden registry templates (universal goal-tagged ones
	// are first because of registry order). Growth-before-activation gate
	// is relaxed here so we don't fall below the minimum.
	if ( primaryFiltered.length < MIN_TASKS ) {
		const used = new Set( primaryFiltered.map( ( t ) => t.id ) );
		const fillers = visibleTemplates.filter( ( t ) => ! used.has( t.id ) );
		primaryFiltered = [ ...primaryFiltered, ...fillers ];
	}

	// Pull launch-site out so it never gets sliced off by VISIBLE_TASK_LIMIT.
	// It sorts last, so when other categories fill the cap it would otherwise
	// disappear — but launch is the user-visible "the wizard had a button" task
	// and must always be present (until the site is launched, in which case
	// hideWhen filters it earlier).
	const launchTemplate = primaryFiltered.find( ( t ) => t.id === 'launch-site' ) ?? null;
	const nonLaunch = primaryFiltered.filter( ( t ) => t.id !== 'launch-site' );

	const headLimit = launchTemplate ? VISIBLE_TASK_LIMIT - 1 : VISIBLE_TASK_LIMIT;
	const sortedHead = sortTasks(
		nonLaunch.map( ( template ) => ( {
			template,
			registryIndex: TASK_REGISTRY.indexOf( template ),
		} ) )
	).slice( 0, headLimit );

	const finalList = launchTemplate
		? [
				...sortedHead,
				{ template: launchTemplate, registryIndex: TASK_REGISTRY.indexOf( launchTemplate ) },
		  ]
		: sortedHead;

	return finalList.map( ( { template } ) => ( {
		...template,
		completed: isCompleted( template, site ),
		resolvedUrl: template.url( site.siteSlug ),
	} ) );
}

/**
 * Render a list of task IDs (e.g. the `task_ids[]` returned by the
 * `tailor_launchpad` ability) as `SelectedTask`s, applying site-state
 * filters and the same category ordering as `selectTasks`.
 *
 * Unknown IDs are dropped silently. Tasks whose `hideWhen` matches the
 * current site state are also dropped — site state can move between the
 * wizard finishing and the dashboard rendering, so a task the AI picked
 * legitimately may have completed in the meantime.
 */
/**
 * Pattern-backed task ids that a goal makes relevant (e.g. `setup-gallery` for
 * portfolio, `setup-bookings` for educate/build).
 *
 * Dolly's `task_ids` are the rendered list, but Dolly is non-deterministic and
 * can drop a clearly relevant task — a portfolio site that never sees the
 * gallery, a studio that never sees the events page. We union these ids into
 * the materialized list (so Dolly augments rather than gates) and pre-warm
 * them, so a goal-relevant pattern task always appears with its copy ready.
 */
export function patternTaskIdsForGoal( goal: GoalKey | null ): string[] {
	if ( ! goal ) {
		return [];
	}
	return TASK_REGISTRY.filter( ( t ) => t.pattern && t.goals?.includes( goal ) ).map(
		( t ) => t.id
	);
}

export function materializeTasks( taskIds: string[], site: SiteState ): SelectedTask[] {
	const idSet = new Set( taskIds );
	// Completed tasks stay in the list (rendered struck-through) rather than
	// being hidden — see the note in selectTasks.
	const matched = TASK_REGISTRY.filter(
		( t ) => idSet.has( t.id ) && ( isCompleted( t, site ) || ! shouldHide( t, site ) )
	);
	const sorted = sortTasks(
		matched.map( ( template ) => ( {
			template,
			registryIndex: TASK_REGISTRY.indexOf( template ),
		} ) )
	);
	return sorted.map( ( { template } ) => ( {
		...template,
		completed: isCompleted( template, site ),
		resolvedUrl: template.url( site.siteSlug ),
	} ) );
}
