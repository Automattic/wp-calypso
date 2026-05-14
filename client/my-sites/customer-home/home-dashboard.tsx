import { SiteThumbnail, Spinner } from '@automattic/components';
import { useSortedLaunchpadTasks } from '@automattic/data-stores';
import { Launchpad } from '@automattic/launchpad';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { Icon, settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QueryPostCounts from 'calypso/components/data/query-post-counts';
import QueryPosts from 'calypso/components/data/query-posts';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { useDispatch, useSelector } from 'calypso/state';
import { getAllPostCount } from 'calypso/state/posts/counts/selectors';
import { getPostsForQuery } from 'calypso/state/posts/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HomeWizard from './home-wizard';
import { materializeTasks, selectTasks, type SelectedTask } from './home-wizard/select-tasks';
import { prewarmTailorAndDraft, tailorAndDraftFromIntent } from './home-wizard/tailor-launchpad';
import TailoredLaunchpad from './home-wizard/tailored-launchpad';
import { TASK_REGISTRY, type SiteState } from './home-wizard/task-registry';
import { HOME_WIZARD_STATE_PREF, type HomeWizardState } from './home-wizard/wizard-state';
import type { FeatureKey, GoalKey, WizardAnswers } from './home-wizard/types';
import type { AppState } from 'calypso/types';

import './home-dashboard.scss';

// Per-site list so each newly created site triggers the wizard once. Kept
// as its own preference (not folded into the combined wizard state) because
// it's a global cross-site list, written independently of any single
// wizard run. The per-run wizard output lives under HOME_WIZARD_STATE_PREF
// — see wizard-state.ts for why it's a single key.
const HOME_WIZARD_COMPLETED_SITES_PREF = 'home_wizard_completed_sites';
// Dolly typically responds in 4-10s for the wizard's structured prompt and
// 25-35s for the intent prompt (which adds inference + draft). 40s gives
// the intent path headroom; observed 5/7 verification prompts landed
// between 28-36s. The skeleton's still capped well before the user would
// interpret silence as "the page is broken."
const TAILORING_TIMEOUT_MS = 40_000;

const RECENT_POSTS_QUERY = { number: 5, status: 'publish' } as const;
const LAUNCHPAD_CONTEXT = 'customer-home';

// Map wizard goal answers onto a Launchpad checklist slug. Anything that
// doesn't have a dedicated launchpad falls back to the generic "build" list.
const GOAL_TO_CHECKLIST: Record< string, string > = {
	write: 'write',
	build: 'build',
	sell: 'sell',
	newsletter: 'newsletter',
	promote: 'build',
	portfolio: 'build',
};

function useSiteState( siteSlug: string ): SiteState {
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const site = useSelector( getSelectedSite );

	const postCount = useSelector( ( state: AppState ) =>
		siteId ? getAllPostCount( state, siteId, 'post', 'publish' ) : 0
	) as number;
	const pageCount = useSelector( ( state: AppState ) =>
		siteId ? getAllPostCount( state, siteId, 'page', 'publish' ) : 0
	) as number;

	const subscriberCount = Number(
		( site?.options as { subscribers_count?: number } | undefined )?.subscribers_count ?? 0
	);
	const isLaunched = site?.launch_status === 'launched';
	const hasCustomDomain = !! site?.URL && ! /\.wordpress\.com$/i.test( new URL( site.URL ).host );

	return {
		siteSlug,
		postCount: postCount ?? 0,
		pageCount: pageCount ?? 0,
		subscriberCount,
		hasCustomDomain,
		isLaunched,
		// TODO: real product/plugin lookups — gated false for now so registry
		// hideWhen rules behave conservatively (show the task until proven done).
		hasProduct: false,
		installedPluginSlugs: [],
	};
}

function TailoringSkeleton() {
	const translate = useTranslate();
	return (
		<div className="home-dashboard__site-setup-skeleton" role="status" aria-live="polite">
			<Text variant="muted">{ translate( 'Tailoring your checklist…' ) }</Text>
			<ul className="home-dashboard__site-setup-skeleton-rows" aria-hidden="true">
				{ [ 0, 1, 2, 3, 4 ].map( ( i ) => (
					<li key={ i } className="home-dashboard__site-setup-skeleton-row" />
				) ) }
			</ul>
		</div>
	);
}

function SiteSetupWidget( { isTailoring }: { isTailoring: boolean } ) {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const site = useSelector( getSelectedSite );
	const wizardState =
		( useSelector( ( state: AppState ) =>
			getPreference( state, HOME_WIZARD_STATE_PREF )
		) as HomeWizardState | null ) ?? {};
	const wizardGoal = wizardState.goal ?? null;
	const tailoredIds = wizardState.taskIds ?? null;
	const wizardIntent = wizardState.intent ?? null;
	const firstPostDraft = wizardState.firstPostDraft ?? null;
	// The wizard infers features from the free-text description rather than
	// collecting them explicitly, so there's no stored feature list — the
	// deterministic fallback runs goal-only.
	const wizardFeatures: FeatureKey[] = [];

	const siteIntent = ( site?.options as { site_intent?: string } | undefined )?.site_intent ?? '';
	const siteState = useSiteState( siteSlug );

	// Prefer the IDs returned by the most recent tailor call. If absent
	// (timed out, errored, returned empty, or pre-feature wizard finish),
	// fall back to the deterministic selectTasks() picks. Both paths apply
	// site-state filters at render time so completion / hideWhen stay live.
	let baseTailoredTasks: SelectedTask[] = [];
	if ( tailoredIds && tailoredIds.length > 0 ) {
		baseTailoredTasks = materializeTasks( tailoredIds, siteState );
	} else if ( wizardGoal ) {
		baseTailoredTasks = selectTasks( wizardGoal, wizardFeatures, siteState );
	}

	// If Dolly drafted a starter post but didn't pick (or had filtered out)
	// any of the three "first creation" tasks, surface the draft anyway by
	// prepending a synthetic publish-first-post row. FirstPostTaskItem
	// renders this with the "Draft your first post" override + Dolly's
	// title as the subtitle. The existing tailored-launchpad gate already
	// routes publish-first-post through FirstPostTaskItem.
	const CREATION_TASK_IDS = new Set( [
		'publish-first-post',
		'add-portfolio-piece',
		'send-first-newsletter',
	] );
	const hasCreationRow = baseTailoredTasks.some( ( t ) => CREATION_TASK_IDS.has( t.id ) );
	const draftIsUsable =
		!! firstPostDraft &&
		typeof firstPostDraft.title === 'string' &&
		Array.isArray( firstPostDraft.paragraphs ) &&
		firstPostDraft.paragraphs.length > 0;

	const tailoredTasks: SelectedTask[] =
		draftIsUsable && ! hasCreationRow
			? ( () => {
					const template = TASK_REGISTRY.find( ( t ) => t.id === 'publish-first-post' );
					if ( ! template ) {
						return baseTailoredTasks;
					}
					const syntheticDraftRow: SelectedTask = {
						...template,
						completed: false,
						resolvedUrl: template.url( siteSlug ),
					};
					return [ syntheticDraftRow, ...baseTailoredTasks ];
			  } )()
			: baseTailoredTasks;

	// Fallback path for users who skipped both entries or whose preferences
	// haven't loaded yet — keep the original server-driven Launchpad.
	const fallbackChecklistSlug =
		siteIntent || ( wizardGoal ? GOAL_TO_CHECKLIST[ wizardGoal ] ?? 'build' : 'build' );
	const {
		data: { checklist: fallbackChecklist },
	} = useSortedLaunchpadTasks( siteSlug, fallbackChecklistSlug, LAUNCHPAD_CONTEXT );

	// The user has "finished onboarding" if EITHER the wizard goal is set
	// OR the prompt intent is stored. Either path is sufficient — without
	// this, prompt-path users would never see the tailored list.
	const hasFinishedOnboarding =
		wizardGoal !== null || ( typeof wizardIntent === 'string' && wizardIntent.length > 0 );
	const useTailored = hasFinishedOnboarding && tailoredTasks.length > 0;
	const fallbackVisible = ! useTailored && ( fallbackChecklist?.length ?? 0 ) > 0;

	if ( ! isTailoring && ! useTailored && ! fallbackVisible ) {
		return null;
	}

	return (
		<Card className="home-dashboard__widget home-dashboard__site-setup" size="small">
			<CardHeader>
				<Heading level={ 2 } size={ 16 }>
					{ translate( 'Site Setup' ) }
				</Heading>
			</CardHeader>
			<CardBody>
				{ ( () => {
					if ( isTailoring ) {
						return <TailoringSkeleton />;
					}
					if ( useTailored ) {
						return <TailoredLaunchpad tasks={ tailoredTasks } />;
					}
					return (
						<Launchpad
							siteSlug={ siteSlug }
							checklistSlug={ fallbackChecklistSlug }
							launchpadContext={ LAUNCHPAD_CONTEXT }
						/>
					);
				} )() }
			</CardBody>
		</Card>
	);
}

function ActivityWidget() {
	const translate = useTranslate();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const posts = useSelector( ( state: AppState ) =>
		siteId ? getPostsForQuery( state, siteId, RECENT_POSTS_QUERY ) : null
	);

	const dateFormatter = new Intl.DateTimeFormat( undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );
	const timeFormatter = new Intl.DateTimeFormat( undefined, {
		hour: 'numeric',
		minute: 'numeric',
	} );

	return (
		<Card className="home-dashboard__widget" size="small">
			{ siteId && <QueryPosts siteId={ siteId } query={ RECENT_POSTS_QUERY } /> }
			<CardHeader>
				<Heading level={ 2 } size={ 16 }>
					{ translate( 'Activity' ) }
				</Heading>
			</CardHeader>
			<CardBody>
				{ posts && posts.length > 0 ? (
					<ul className="home-dashboard__activity-list">
						{ posts.map( ( post ) => {
							const date = post.date ? new Date( post.date ) : null;
							return (
								<li key={ post.ID } className="home-dashboard__activity-item">
									<Text variant="muted" size={ 12 }>
										{ date
											? `${ dateFormatter.format( date ) } · ${ timeFormatter.format( date ) }`
											: '' }
									</Text>
									<a href={ post.URL }>{ post.title || translate( '(Untitled)' ) }</a>
								</li>
							);
						} ) }
					</ul>
				) : (
					<Text variant="muted">{ translate( 'No recent activity yet.' ) }</Text>
				) }
			</CardBody>
		</Card>
	);
}

function AtAGlanceWidget() {
	const translate = useTranslate();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const postCount = useSelector( ( state: AppState ) =>
		siteId ? getAllPostCount( state, siteId, 'post', 'publish' ) : 0
	);
	const pageCount = useSelector( ( state: AppState ) =>
		siteId ? getAllPostCount( state, siteId, 'page', 'publish' ) : 0
	);
	const commentCount = useSelector( ( state: AppState ) =>
		siteId ? Number( getSiteOption( state, siteId, 'comment_count' ) ?? 0 ) : 0
	);

	return (
		<Card className="home-dashboard__widget" size="small">
			{ siteId && <QueryPostCounts siteId={ siteId } type="post" /> }
			{ siteId && <QueryPostCounts siteId={ siteId } type="page" /> }
			<CardHeader>
				<Heading level={ 2 } size={ 16 }>
					{ translate( 'At a Glance' ) }
				</Heading>
			</CardHeader>
			<CardBody>
				<ul className="home-dashboard__glance-list">
					<li>
						<a href={ `/posts/${ siteSlug }` }>
							{ translate( '%(count)d post', '%(count)d posts', {
								count: postCount ?? 0,
								args: { count: postCount ?? 0 },
							} ) }
						</a>
					</li>
					<li>
						<a href={ `/comments/all/${ siteSlug }` }>
							{ translate( '%(count)d comment', '%(count)d comments', {
								count: commentCount,
								args: { count: commentCount },
							} ) }
						</a>
					</li>
					<li>
						<a href={ `/pages/${ siteSlug }` }>
							{ translate( '%(count)d page', '%(count)d pages', {
								count: pageCount ?? 0,
								args: { count: pageCount ?? 0 },
							} ) }
						</a>
					</li>
				</ul>
			</CardBody>
		</Card>
	);
}

const PREVIEW_WIDTH = 800;
const PREVIEW_HEIGHT = 500;

function SitePreviewWidget() {
	const translate = useTranslate();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const siteUrl = useSelector( ( state: AppState ) =>
		siteId ? getSiteUrl( state, siteId ) : null
	);
	const activeThemeId = useSelector( ( state: AppState ) =>
		siteId ? getActiveTheme( state, siteId ) : null
	);
	const theme = useSelector( ( state: AppState ) =>
		siteId && activeThemeId ? getCanonicalTheme( state, siteId, activeThemeId ) : null
	);

	// Coming-soon / unlaunched sites serve a wp.com placeholder page on their
	// public URL — useless as a preview. Fall back to the active theme's
	// public demo so users see what their theme actually looks like.
	const isPublic = site?.launch_status === 'launched' && ! site?.is_coming_soon;
	const previewTarget =
		isPublic && siteUrl ? siteUrl : ( theme?.demo_uri as string | undefined ) ?? '';

	const previewLabel = translate( 'Site preview' ) as string;

	return (
		<Card className="home-dashboard__widget home-dashboard__site-preview-card" size="small">
			{ siteId && <QueryActiveTheme siteId={ siteId } /> }
			{ siteId && activeThemeId && (
				<QueryCanonicalTheme siteId={ siteId } themeId={ activeThemeId } />
			) }
			<CardHeader>
				<Heading level={ 2 } size={ 16 }>
					{ translate( 'Site Preview' ) }
				</Heading>
			</CardHeader>
			<CardBody>
				<div className="home-dashboard__site-preview-frame">
					<SiteThumbnail
						mShotsUrl={ previewTarget }
						alt={ previewLabel }
						aria-label={ previewLabel }
						width={ PREVIEW_WIDTH }
						height={ PREVIEW_HEIGHT }
						mshotsOption={ { vpw: 1600, vph: 1000, w: PREVIEW_WIDTH, h: PREVIEW_HEIGHT } }
					>
						<Spinner />
					</SiteThumbnail>
				</div>
				<div className="home-dashboard__site-preview-meta">
					<div>
						<div className="home-dashboard__site-preview-name">
							{ site?.name || translate( 'Site' ) }
						</div>
						{ siteUrl && (
							<a
								className="home-dashboard__site-preview-url"
								href={ siteUrl }
								target="_blank"
								rel="noreferrer"
							>
								{ new URL( siteUrl ).host }
							</a>
						) }
					</div>
					<Button variant="secondary" href={ `/site-editor/${ siteSlug }` } __next40pxDefaultSize>
						{ translate( 'Edit Site' ) }
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}

function useHomeWizard() {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const completedSites = useSelector( ( state: AppState ) =>
		getPreference( state, HOME_WIZARD_COMPLETED_SITES_PREF )
	) as number[] | null;
	const forced =
		typeof window !== 'undefined' &&
		new URLSearchParams( window.location.search ).get( 'wizard' ) === 'force';

	const completedForSite =
		siteId !== null && Array.isArray( completedSites ) && completedSites.includes( siteId );

	// Local state owns the open/close lifecycle so Skip / Finish close the
	// wizard synchronously, even if the savePreference dispatch hasn't yet
	// round-tripped through redux.
	const [ isOpen, setIsOpen ] = useState< boolean >( forced || ! completedForSite );
	const touched = useRef( false );

	// While the user hasn't interacted yet, keep the open state in sync with
	// the latest "completed for this site" check (preferences finish loading,
	// site selection changes, etc.).
	useEffect( () => {
		if ( touched.current ) {
			return;
		}
		setIsOpen( forced || ! completedForSite );
	}, [ forced, completedForSite ] );

	const open = () => {
		touched.current = true;
		setIsOpen( true );
	};

	// Closes the wizard and records this site as done. The wizard's actual
	// answers (goal, intent, draft, …) are persisted by `useTailoredFlow`
	// under the combined `home_wizard_state` key — `finish` only owns the
	// open/close lifecycle and the global completed-sites list.
	const finish = () => {
		touched.current = true;
		setIsOpen( false );

		if ( siteId !== null ) {
			const next = Array.from( new Set( [ ...( completedSites ?? [] ), siteId ] ) );
			dispatch( savePreference( HOME_WIZARD_COMPLETED_SITES_PREF, next ) );
		}
		if ( forced && typeof window !== 'undefined' ) {
			const url = new URL( window.location.href );
			url.searchParams.delete( 'wizard' );
			window.history.replaceState( null, '', url.toString() );
		}
	};

	return { isOpen, open, finish };
}

/**
 * Owns the post-finish async hop for both entry paths (the goals × features
 * wizard and the free-text prompt). For each path:
 *   - kick off the tailor call (real Dolly by default; mock when `?mock=*`)
 *   - kick off the first-post draft in parallel (fire-and-forget)
 *   - share a 13s abort signal across both calls
 *   - silently fall back to the deterministic `selectTasks` output on any
 *     timeout / empty / error
 */
function useTailoredFlow() {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const [ isTailoring, setIsTailoring ] = useState< boolean >( false );

	const startTailoring = (): {
		controller: AbortController;
		finalize: () => void;
	} => {
		setIsTailoring( true );
		const controller = new AbortController();
		const timeoutId = setTimeout( () => controller.abort(), TAILORING_TIMEOUT_MS );
		const finalize = () => {
			clearTimeout( timeoutId );
			setIsTailoring( false );
		};
		return { controller, finalize };
	};

	// Read-modify-write of the combined wizard-state preference: pull the
	// current value out of redux, merge the patch, save the whole thing back
	// in a single `savePreference`. Every write stage goes through this so
	// each is one PUT that preserves what earlier stages wrote — see
	// HOME_WIZARD_STATE_PREF for why one key (one PUT per stage) matters.
	const mergeWizardState = ( patch: Partial< HomeWizardState > ) => {
		dispatch( ( innerDispatch, getState ) => {
			const current =
				( getPreference( getState(), HOME_WIZARD_STATE_PREF ) as HomeWizardState | null ) ?? {};
			innerDispatch( savePreference( HOME_WIZARD_STATE_PREF, { ...current, ...patch } ) );
		} );
	};

	const runFromAnswers = ( answers: WizardAnswers ) => {
		if ( ! answers.goal ) {
			return;
		}
		// Wizard now collects (goal, siteName, intent). We compose those into
		// one prompt and reuse the same Dolly call as the prompt path so both
		// entry points produce identical tailoring + draft outputs.
		const trimmedName = answers.siteName?.trim() ?? '';
		const trimmedIntent = answers.intent?.trim() ?? '';
		const composed = [
			`User selected goal: ${ answers.goal }`,
			trimmedName ? `Site name: ${ trimmedName }` : '',
			trimmedIntent,
		]
			.filter( Boolean )
			.join( '\n' );

		// Write stage 1: the inputs, persisted before the async hop starts.
		// `goal` lives here now (not in `finish`) so the whole wizard run is
		// one key. `setPreference` inside `savePreference` runs synchronously,
		// so stages 2 and 3 are guaranteed to read this back.
		mergeWizardState( {
			goal: answers.goal,
			intent: composed,
			...( trimmedName ? { siteName: trimmedName } : {} ),
		} );

		const { controller, finalize } = startTailoring();

		tailorAndDraftFromIntent(
			{ intent: composed },
			{
				siteId: siteId ?? undefined,
				abortSignal: controller.signal,
				// Streaming early-paint: task_ids arrives long before the draft
				// finishes generating. Persist + drop the skeleton here so the
				// user sees real tailored tasks ~10s sooner; the draft fills in
				// when the rest of the stream completes. Write stage 2.
				onPartialTaskIds: ( ids ) => {
					if ( ids.length > 0 ) {
						mergeWizardState( { taskIds: ids } );
					}
					setIsTailoring( false );
				},
			}
		)
			// Write stage 3: the full result. One merge for task_ids + inferred
			// + draft so the draft (the subtitle source) can't be clobbered by
			// a sibling write landing out of order.
			.then( ( result ) => {
				const patch: Partial< HomeWizardState > = {
					inferred: result.inferred ?? {},
					firstPostDraft: result.first_post_draft,
				};
				if ( result.task_ids.length > 0 ) {
					patch.taskIds = result.task_ids;
				}
				mergeWizardState( patch );
			} )
			.catch( ( error ) => {
				window.console?.warn?.( '[Launchpad] tailor_and_draft (wizard) failed:', error );
			} )
			.finally( finalize );
	};

	const prewarm = useCallback(
		( answers: { goal: GoalKey | null; siteName: string; intent: string } ) => {
			if ( ! answers.goal ) {
				return;
			}
			const trimmedName = answers.siteName.trim();
			const trimmedIntent = answers.intent.trim();
			if ( ! trimmedIntent && ! trimmedName ) {
				return;
			}
			// Compose with the same shape the wizard uses on Finish so the
			// cache hit lands cleanly when Continue fires.
			const composed = [
				`User selected goal: ${ answers.goal }`,
				trimmedName ? `Site name: ${ trimmedName }` : '',
				trimmedIntent,
			]
				.filter( Boolean )
				.join( '\n' );
			prewarmTailorAndDraft( composed, { siteId: siteId ?? undefined } );
		},
		[ siteId ]
	);

	return { isTailoring, runFromAnswers, prewarm };
}

function useBodyClass( className: string, active: boolean ) {
	useEffect( () => {
		if ( ! active ) {
			return;
		}
		document.body.classList.add( className );
		return () => document.body.classList.remove( className );
	}, [ active, className ] );
}

export default function HomeDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { isOpen: isWizardOpen, open: openWizard, finish: finishWizard } = useHomeWizard();
	const { isTailoring, runFromAnswers, prewarm } = useTailoredFlow();

	const selectedSiteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const currentSiteName = useSelector(
		( state: AppState ) => getSelectedSite( state )?.name ?? ''
	);

	useBodyClass( 'is-home-wizard-open', isWizardOpen );

	const handleWizardComplete = ( answers: WizardAnswers ) => {
		// If the user changed the site name in the wizard, push it to
		// Site Settings (blogname) so the new title persists site-wide.
		const trimmedName = answers.siteName?.trim() ?? '';
		if ( selectedSiteId !== null && trimmedName !== '' && trimmedName !== currentSiteName.trim() ) {
			dispatch( saveSiteSettings( selectedSiteId, { blogname: trimmedName } ) );
		}
		finishWizard();
		runFromAnswers( answers );
	};

	return (
		<div className={ 'home-dashboard' + ( isWizardOpen ? ' home-dashboard--wizard-open' : '' ) }>
			<QueryPreferences />
			{ ! isWizardOpen && (
				<>
					<header className="home-dashboard__page-header">
						<Heading level={ 1 } size={ 24 }>
							{ translate( 'Dashboard' ) }
						</Heading>
					</header>
					<div className="home-dashboard__grid">
						<div className="home-dashboard__col home-dashboard__col--main">
							<SiteSetupWidget isTailoring={ isTailoring } />
							<div className="home-dashboard__row">
								<ActivityWidget />
								<AtAGlanceWidget />
							</div>
						</div>
						<div className="home-dashboard__col home-dashboard__col--side">
							<SitePreviewWidget />
						</div>
					</div>
				</>
			) }
			{ isWizardOpen && (
				<HomeWizard
					initialSiteName={ currentSiteName }
					onClose={ () => finishWizard() }
					onComplete={ handleWizardComplete }
					onPrewarm={ prewarm }
				/>
			) }
			{ ! isWizardOpen && (
				<button
					type="button"
					className="home-dashboard__wizard-fab"
					onClick={ openWizard }
					aria-label={ translate( 'Open setup wizard' ) as string }
				>
					<Icon icon={ settings } size={ 20 } />
					<span>{ translate( 'Wizard' ) }</span>
				</button>
			) }
		</div>
	);
}
