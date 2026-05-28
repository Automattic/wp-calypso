import page from '@automattic/calypso-router';
import { useSortedLaunchpadTasks } from '@automattic/data-stores';
import { Launchpad } from '@automattic/launchpad';
import { Dropdown, MenuGroup, MenuItem, __experimentalText as Text } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { Icon, external, settings } from '@wordpress/icons';
import { Button, Card as UICard, Text as UIText, Stack } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QueryPosts from 'calypso/components/data/query-posts';
import QueryPreferences from 'calypso/components/data/query-preferences';
import SitePreview from 'calypso/dashboard/sites/site-preview';
import { useDispatch, useSelector } from 'calypso/state';
import { getPostsForQuery } from 'calypso/state/posts/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HomeWizard from './home-wizard';
import { draftPatternPage, type PatternPage } from './home-wizard/draft-pattern-page';
import { buildPickThemeSubtitle } from './home-wizard/recommend-themes';
import {
	materializeTasks,
	patternTaskIdsForGoal,
	selectTasks,
	type SelectedTask,
} from './home-wizard/select-tasks';
import { prewarmTailorAndDraft, tailorAndDraftFromIntent } from './home-wizard/tailor-launchpad';
import TailoredLaunchpad from './home-wizard/tailored-launchpad';
import TaskRegistryPreview from './home-wizard/task-preview';
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

const LAUNCHPAD_CONTEXT = 'customer-home';

// Every new WordPress site ships default seed content: a "Hello world!" post
// (slug `hello-world`) and a "Sample Page" (slug `sample-page`). Neither must
// count as the user's own first post/page — otherwise a brand-new site reads
// as already having published one, which marks the task done / hides it. We
// fetch the published posts + pages and exclude these slugs. (English-default
// slugs; localized installs may differ, but they're stable on wp.com new sites.)
const DEFAULT_POST_SLUG = 'hello-world';
const DEFAULT_PAGE_SLUG = 'sample-page';
// Stable query references (module-level) for the published-posts / -pages
// fetch + selector. A small page is enough to detect whether any real one exists.
const PUBLISHED_POSTS_QUERY = { status: 'publish', number: 20 };
const PUBLISHED_PAGES_QUERY = { status: 'publish', number: 20, type: 'page' };

// Map wizard goal answers onto a Launchpad checklist slug. Anything that
// doesn't have a dedicated launchpad falls back to the generic "build" list.
const GOAL_TO_CHECKLIST: Record< string, string > = {
	write: 'write',
	build: 'build',
	sell: 'sell',
	newsletter: 'newsletter',
	educate: 'build',
	portfolio: 'build',
};

function useSiteState( siteSlug: string ): SiteState {
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const site = useSelector( getSelectedSite );

	// Count the user's published posts, excluding the default "Hello world!"
	// seed. `getPostsForQuery` returns null until the list loads — treat that
	// as "none yet" so we never momentarily flash the first-post task as done.
	const publishedPosts = useSelector( ( state: AppState ) =>
		siteId ? getPostsForQuery( state, siteId, PUBLISHED_POSTS_QUERY ) : null
	);
	const postCount = ( publishedPosts ?? [] ).filter(
		( post: { slug?: string } ) => post?.slug !== DEFAULT_POST_SLUG
	).length;
	// Same treatment for pages: count the user's published pages, excluding the
	// default "Sample Page" seed.
	const publishedPages = useSelector( ( state: AppState ) =>
		siteId ? getPostsForQuery( state, siteId, PUBLISHED_PAGES_QUERY ) : null
	);
	const pageCount = ( publishedPages ?? [] ).filter(
		( page: { slug?: string } ) => page?.slug !== DEFAULT_PAGE_SLUG
	).length;

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
	const siteId = site?.ID ?? null;
	const storedWizardState =
		( useSelector( ( state: AppState ) =>
			getPreference( state, HOME_WIZARD_STATE_PREF )
		) as HomeWizardState | null ) ?? {};
	// The wizard-state pref is a single global blob. Ignore it unless it was
	// stamped with the currently selected site — otherwise a new site would show
	// the previous site's tailored tasks, first-post draft, and pattern pages.
	const wizardState: HomeWizardState =
		storedWizardState.siteId != null && storedWizardState.siteId === siteId
			? storedWizardState
			: {};
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
		// Union Dolly's picks with the goal's relevant pattern tasks so Dolly
		// augments the list rather than gating it — a portfolio site always gets
		// the gallery, a studio the events page, even if Dolly's pick omitted it.
		// materializeTasks dedupes and applies the same ordering + hide filters.
		const mergedIds = [ ...new Set( [ ...tailoredIds, ...patternTaskIdsForGoal( wizardGoal ) ] ) ];
		baseTailoredTasks = materializeTasks( mergedIds, siteState );
	} else if ( wizardGoal ) {
		baseTailoredTasks = selectTasks( wizardGoal, wizardFeatures, siteState );
	}

	// pick-theme has no server-side completion signal (every site always has an
	// active theme), so we complete it when the user activated one via the
	// picker. The wizard-state pref is a single global blob, so only complete
	// when the recorded pick was made on THIS site (`pickedThemeSiteId`) —
	// otherwise a newly created site would inherit a previous site's pick.
	const pickedThemeOnThisSite =
		!! wizardState.pickedThemeSlug && siteId !== null && wizardState.pickedThemeSiteId === siteId;
	if ( pickedThemeOnThisSite ) {
		baseTailoredTasks = baseTailoredTasks.map( ( t ) =>
			t.id === 'pick-theme' ? { ...t, completed: true } : t
		);
	}

	// `setup-store` and `discover-woocommerce` both install Woo today — the
	// discover row was meant as the "why" but reads as a duplicate when both
	// are picked. Drop the discover row in that case; its 42-day-sooner stat
	// now lives on `setup-store`'s subtitle (see task-registry.ts).
	if (
		baseTailoredTasks.some( ( t ) => t.id === 'setup-store' ) &&
		baseTailoredTasks.some( ( t ) => t.id === 'discover-woocommerce' )
	) {
		baseTailoredTasks = baseTailoredTasks.filter( ( t ) => t.id !== 'discover-woocommerce' );
	}

	// For the sell goal, enforce the merchant-shaped sequence: pick a theme
	// (so product pages have a frame), set up the store (Woo install — needed
	// before you can list anything), then add the first product. selectTasks()
	// emits add-first-product before pick-theme (registry order, both in
	// activation) and setup-store last (feature-setup category sorts after
	// activation), which jumbles the cognitive order for a new merchant.
	if ( wizardGoal === 'sell' ) {
		const pull = ( id: string ) => {
			const idx = baseTailoredTasks.findIndex( ( t ) => t.id === id );
			return idx === -1 ? null : baseTailoredTasks.splice( idx, 1 )[ 0 ];
		};
		const theme = pull( 'pick-theme' );
		const store = pull( 'setup-store' );
		const product = pull( 'add-first-product' );
		baseTailoredTasks = [
			...( theme ? [ theme ] : [] ),
			...( store ? [ store ] : [] ),
			...( product ? [ product ] : [] ),
			...baseTailoredTasks,
		];
	}

	// Two different "creation task" concepts:
	//   ANY_CREATION_TASK_IDS — broad: "did the user's picked list already
	//     include some first-creation step?" Used to decide whether to
	//     inject a synthetic publish-first-post row. For sell goal, the
	//     creation step is `add-first-product`, so we should NOT inject a
	//     blog-post row on top of it.
	//   POST_DRAFT_REFRAME_IDS — narrow: "which task ids should be reframed
	//     as 'Draft your first post' when a Dolly post draft exists?" Only
	//     the post-shaped ones — a product-listing task isn't a draft.
	const ANY_CREATION_TASK_IDS = new Set( [
		'publish-first-post',
		'add-portfolio-piece',
		'send-first-newsletter',
		'add-first-product',
	] );
	const POST_DRAFT_REFRAME_IDS = new Set( [
		'publish-first-post',
		'add-portfolio-piece',
		'send-first-newsletter',
	] );
	const hasCreationRow = baseTailoredTasks.some( ( t ) => ANY_CREATION_TASK_IDS.has( t.id ) );
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

	// When Dolly drafted a starter post, reframe whichever post-shaped
	// creation task carries it: the row title becomes the action ("Draft
	// your first post") and the subtitle becomes Dolly's verb-led
	// description. add-first-product is intentionally excluded — listing
	// a product isn't "draft a post."
	const reframedForDraft: SelectedTask[] = draftIsUsable
		? tailoredTasks.map( ( task ) =>
				POST_DRAFT_REFRAME_IDS.has( task.id ) && ! task.completed
					? {
							...task,
							title: translate( 'Draft your first post' ) as string,
							subtitle: firstPostDraft?.subtitle ?? firstPostDraft?.title ?? task.subtitle,
					  }
					: task
		  )
		: tailoredTasks;

	// Personalize the pick-theme subtitle using the wizard's inferred niche
	// and vibe. This is the COLLAPSED-row subtitle the user sees before they
	// expand the task — by repeating their own words ("Designs that match
	// your silver jewelry store"), the row reads as "this list knows me"
	// before any modal opens. Falls back to the static registry subtitle when
	// inferred is absent (e.g., goal-only wizard finish).
	const inferredContext = wizardState.inferred ?? null;
	const personalizedThemeSubtitle = buildPickThemeSubtitle( inferredContext );
	const displayTasks: SelectedTask[] = personalizedThemeSubtitle
		? reframedForDraft.map( ( task ) =>
				task.id === 'pick-theme' ? { ...task, subtitle: personalizedThemeSubtitle } : task
		  )
		: reframedForDraft;

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
	const useTailored = hasFinishedOnboarding && displayTasks.length > 0;
	const fallbackVisible = ! useTailored && ( fallbackChecklist?.length ?? 0 ) > 0;

	if ( ! isTailoring && ! useTailored && ! fallbackVisible ) {
		return null;
	}

	const completedCount = displayTasks.filter( ( task ) => task.completed ).length;
	const progressLabel = translate( '%(completed)d of %(total)d completed', {
		args: { completed: completedCount, total: displayTasks.length },
	} ) as string;

	return (
		<section className="home-dashboard__site-setup site-setup">
			{ /* Refetch posts + pages whenever the dashboard mounts (e.g. on return
			   from the editor) so a freshly published post/page flips the relevant
			   task to completed without a manual reload. Posts/pages (not counts)
			   so we can exclude the default "Hello world!" / "Sample Page" seeds
			   by slug. */ }
			{ site?.ID && (
				<QueryPosts siteId={ site.ID } postId={ undefined } query={ PUBLISHED_POSTS_QUERY } />
			) }
			{ site?.ID && (
				<QueryPosts siteId={ site.ID } postId={ undefined } query={ PUBLISHED_PAGES_QUERY } />
			) }
			<Stack direction="column" gap="2xl">
				<Stack direction="column" gap="xs" className="site-setup__heading">
					{ /* WPDS injects the text content via the render prop, but the
					   jsx-a11y rule can't see through that and flags the self-closing
					   <h2 />. Disable narrowly — the heading does carry content. */ }
					{ /* eslint-disable-next-line jsx-a11y/heading-has-content */ }
					<UIText variant="heading-2xl" render={ <h2 /> }>
						{ translate( 'Get the most out of WordPress' ) }
					</UIText>
					{ useTailored && (
						<UIText variant="body-md" className="site-setup__progress">
							{ progressLabel }
						</UIText>
					) }
				</Stack>
				<div className="site-setup__grid">
					<div className="site-setup__launchpad">
						{ ( () => {
							if ( isTailoring ) {
								return <TailoringSkeleton />;
							}
							if ( useTailored ) {
								return <TailoredLaunchpad tasks={ displayTasks } />;
							}
							return (
								<Launchpad
									siteSlug={ siteSlug }
									checklistSlug={ fallbackChecklistSlug }
									launchpadContext={ LAUNCHPAD_CONTEXT }
								/>
							);
						} )() }
					</div>
					<ThemePreviewCard />
				</div>
			</Stack>
		</section>
	);
}

/**
 * The theme preview shown alongside the Launchpad checklist. A @wordpress/ui
 * Card whose content is a full-bleed sandboxed iframe of the site's real
 * theme — the launched site itself when public, otherwise the active
 * theme's public demo (a coming-soon site's own URL is a wp.com placeholder).
 */
function ThemePreviewCard() {
	const translate = useTranslate();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const siteUrl = useSelector( ( state: AppState ) =>
		siteId ? getSiteUrl( state, siteId ) : null
	);
	// Display host for the caption: strip protocol + trailing slash off the
	// site's public URL (e.g. "susuwata.wordpress.com").
	const displayUrl = site?.URL ? site.URL.replace( /^https?:\/\//, '' ).replace( /\/$/, '' ) : '';
	const activeThemeId = useSelector( ( state: AppState ) =>
		siteId ? getActiveTheme( state, siteId ) : null
	);
	const theme = useSelector( ( state: AppState ) =>
		siteId && activeThemeId ? getCanonicalTheme( state, siteId, activeThemeId ) : null
	);

	const isPublic = site?.launch_status === 'launched' && ! site?.is_coming_soon;
	const liveSiteUrl = isPublic && siteUrl ? siteUrl : null;
	const previewTarget = liveSiteUrl ?? ( theme?.demo_uri as string | undefined ) ?? '';

	// Theme-demo URLs render a "Get this theme on WordPress.com" promo bar that
	// hide_banners=true doesn't suppress, so we shift the iframe up to crop it.
	// A LIVE site has no such banner — shifting there would crop real header
	// content AND leave a white strip at the bottom (the iframe was only as
	// tall as the card, not the card + offset). So crop only for demos, and
	// grow the iframe by the same offset so it always fills to the bottom.
	const BANNER_CROP_PX = 34;
	const bannerCrop = liveSiteUrl ? 0 : BANNER_CROP_PX;

	// Same pattern as the /sites grid + overview SitePreviewCard: render the
	// target page in a sandboxed iframe at a 1200px virtual width, then scale
	// the transform to fit whatever size the container ends up. SitePreview
	// appends `?hide_banners=true&preview=true&iframe=true` so the
	// "Get this theme on WordPress.com" promo, cookie banners, and admin bar
	// stay hidden in the screenshot.
	const [ resizeListener, sizes ] = useResizeObserver();
	const width = sizes?.width ?? null;
	const height = sizes?.height ?? null;
	const scale = width ? width / 1200 : 0;

	return (
		<div className="site-setup__theme-wrap">
			<UICard.Root className="site-setup__theme">
				{ siteId && <QueryActiveTheme siteId={ siteId } /> }
				{ siteId && activeThemeId && (
					<QueryCanonicalTheme siteId={ siteId } themeId={ activeThemeId } />
				) }
				<UICard.Content className="site-setup__theme-content">
					<UICard.FullBleed className="site-setup__theme-bleed">
						{ resizeListener }
						{ previewTarget && width && height && (
							<div className="site-setup__theme-iframe" style={ { top: `${ -bannerCrop }px` } }>
								<SitePreview
									url={ previewTarget }
									scale={ scale }
									height={ ( height + bannerCrop ) / scale }
								/>
							</div>
						) }
						{ /* Reveal a "Edit site" CTA on hover/focus so the preview doubles
						   as an entry point into the Site Editor (stays in Calypso). */ }
						{ siteSlug && (
							<div className="site-setup__theme-overlay">
								<Button
									variant="solid"
									tone="brand"
									onClick={ () => page( `/site-editor/${ siteSlug }` ) }
								>
									{ translate( 'Edit site' ) }
								</Button>
							</div>
						) }
					</UICard.FullBleed>
				</UICard.Content>
			</UICard.Root>
			{ ( site?.name || displayUrl ) && (
				<div className="site-setup__theme-caption">
					{ site?.name && (
						<UIText variant="body-md" className="site-setup__theme-name">
							{ site.name }
						</UIText>
					) }
					{ displayUrl && site?.URL && (
						<a
							className="site-setup__theme-url"
							href={ site.URL }
							target="_blank"
							rel="noopener noreferrer"
						>
							<span className="site-setup__theme-url-text">{ displayUrl }</span>
							<Icon icon={ external } size={ 16 } />
						</a>
					) }
				</div>
			) }
		</div>
	);
}

function useHomeWizard() {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const completedSites = useSelector( ( state: AppState ) =>
		getPreference( state, HOME_WIZARD_COMPLETED_SITES_PREF )
	) as number[] | null;
	// Don't decide the wizard's open state until remote preferences have
	// actually loaded. On a fresh page load (e.g. returning to /home from the
	// editor via the post-publish "Next steps" link) preferences are still
	// fetching, so `completedSites` is null and the site looks "not completed"
	// — which would flash the wizard open over the launchpad the user came
	// back to see. Gating on this keeps the wizard closed until we KNOW.
	const prefsLoaded = useSelector( hasReceivedRemotePreferences );
	const forced =
		typeof window !== 'undefined' &&
		new URLSearchParams( window.location.search ).get( 'wizard' ) === 'force';

	const completedForSite =
		siteId !== null && Array.isArray( completedSites ) && completedSites.includes( siteId );

	// Auto-open only once prefs AND the site are known and this site genuinely
	// hasn't done the wizard. `forced` (?wizard=force) always opens. Gating on
	// siteId too: during a fresh load the site object can lag prefs, and a null
	// siteId reads as "not completed" → premature open over the launchpad.
	const shouldAutoOpen = forced || ( prefsLoaded && siteId !== null && ! completedForSite );

	// Local state owns the open/close lifecycle so Skip / Finish close the
	// wizard synchronously, even if the savePreference dispatch hasn't yet
	// round-tripped through redux.
	const [ isOpen, setIsOpen ] = useState< boolean >( shouldAutoOpen );
	const touched = useRef( false );

	// While the user hasn't interacted yet, keep the open state in sync with
	// the latest check (preferences finish loading, site selection changes).
	useEffect( () => {
		if ( touched.current ) {
			return;
		}
		setIsOpen( shouldAutoOpen );
	}, [ shouldAutoOpen ] );

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

	// Read-modify-write for one pattern page, keyed by category. Reads the
	// latest patternPages at resolve time so two pre-warms (e.g. gallery +
	// contact) each merge in without clobbering the other.
	const cachePatternPage = ( category: string, patternPage: PatternPage ) => {
		dispatch( ( innerDispatch, getState ) => {
			const current =
				( getPreference( getState(), HOME_WIZARD_STATE_PREF ) as HomeWizardState | null ) ?? {};
			innerDispatch(
				savePreference( HOME_WIZARD_STATE_PREF, {
					...current,
					patternPages: { ...( current.patternPages ?? {} ), [ category ]: patternPage },
				} )
			);
		} );
	};

	// After tailoring lands, build any pattern-backed tasks Dolly picked (e.g.
	// setup-gallery) in the background and cache the populated markup, so the
	// task's CTA can create the page instantly on click. A miss just means the
	// CTA fetches the raw pattern on click instead — fire-and-forget.
	const prewarmPatternPages = ( taskIds: string[], intent: string, siteName: string ) => {
		const seen = new Set< string >();
		for ( const id of taskIds ) {
			const template = TASK_REGISTRY.find( ( t ) => t.id === id );
			if ( ! template?.pattern || seen.has( template.pattern.category ) ) {
				continue;
			}
			seen.add( template.pattern.category );
			const { category, pageTitle, intro, images } = template.pattern;
			draftPatternPage(
				{ category, pageTitle, intro, images, intent, siteName: siteName || undefined },
				{ siteId: siteId ?? undefined }
			)
				.then( ( patternPage ) => cachePatternPage( category, patternPage ) )
				.catch(
					( error ) =>
						window.console?.warn?.(
							`[Launchpad] prewarm pattern page (${ category }) failed:`,
							error
						)
				);
		}
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

		const { controller, finalize } = startTailoring();

		// Persist the user's literal inputs (goal + composed intent) up front,
		// BEFORE the Dolly call. This is the deterministic floor: if the call
		// times out, errors, or returns empty, the widget still has `goal` and
		// renders the deterministic selectTasks() list (e.g. the sell-shaped
		// theme → store → product sequence) instead of going blank. Previously
		// nothing was saved until the `.then`, so any failed call left the
		// dashboard with no tailored list at all.
		//
		// This re-introduces a second write per run, but the two are ~30s apart
		// (this one on Finish, the result merge after Dolly), so they never
		// overlap — the savePreference echo race the single-write design guarded
		// against needs concurrent in-flight PUTs to the same key.
		// REPLACE (not merge) the blob, stamped with this site's id: the pref is a
		// single global blob, so merging would let a new site inherit the previous
		// run's taskIds / firstPostDraft / inferred / patternPages until Dolly
		// returns (and forever if it fails). A fresh write clears all of that; the
		// result merge below lands on top for the same site.
		dispatch(
			savePreference( HOME_WIZARD_STATE_PREF, {
				siteId: siteId ?? undefined,
				goal: answers.goal ?? undefined,
				intent: composed,
				...( trimmedName ? { siteName: trimmedName } : {} ),
			} )
		);

		// ONE result write per wizard run — merges the Dolly output on top of
		// the floor above.
		// The savePreference race lives at the receivePreferences layer:
		// even though we use one key (home_wizard_state), three saves to the
		// SAME key in quick succession can echo out of order, with an early
		// echo wholesale-replacing remoteValues using the server's then-current
		// blob (which still has the *previous* run's inferred). That made the
		// theme picker render with stale inferred. Single save = no race.
		//
		// Trade-off: we lose the early-paint partial of task_ids (stage 2 in
		// the old flow). The dashboard skeleton stays for the full Dolly
		// duration (~30s) instead of swapping in tasks ~1-2s before the draft.
		// Worth it for picker correctness. If the user refreshes mid-wizard
		// their goal + intent survive (written above), so the deterministic
		// list renders; only the Dolly draft/inferred are lost until a re-run.
		tailorAndDraftFromIntent(
			{ intent: composed },
			{
				siteId: siteId ?? undefined,
				abortSignal: controller.signal,
				// No-op: we used to drop the skeleton + persist partial task_ids
				// here for an early paint, but that surfaced the PREVIOUS run's
				// tasks until stage 3 completed (since the picker reads from the
				// same key). Skeleton stays until the full result lands in the
				// `.then` below — cleaner UX, no flash of stale tasks.
				onPartialTaskIds: () => {},
			}
		)
			.then( ( result ) => {
				const patch: Partial< HomeWizardState > = {
					// Re-stamp the site id so the merge preserves it even if the floor
					// write was somehow skipped — the dashboard gates on this.
					siteId: siteId ?? undefined,
					// answers.goal is GoalKey | null; the stored field is optional
					// (GoalKey | undefined), so coerce null → undefined.
					goal: answers.goal ?? undefined,
					intent: composed,
					inferred: result.inferred ?? {},
					firstPostDraft: result.first_post_draft,
					...( trimmedName ? { siteName: trimmedName } : {} ),
				};
				if ( result.task_ids.length > 0 ) {
					patch.taskIds = result.task_ids;
				}
				mergeWizardState( patch );
				// Tagline: Dolly drafts a polished short version from the raw
				// description (≤80 chars, third-person). Fall back to the raw
				// description if it's missing or empty. Cap client-side as a
				// safety net in case Dolly ignores the length hint.
				if ( siteId !== null ) {
					const tagline = result.inferred?.tagline?.trim() || trimmedIntent;
					if ( tagline !== '' ) {
						dispatch( saveSiteSettings( siteId, { blogdescription: tagline.slice( 0, 100 ) } ) );
					}
				}
				// Pre-warm the union of Dolly's picks and the goal's guaranteed
				// pattern tasks — the latter are merged into the rendered list, so
				// their copy must be ready too.
				prewarmPatternPages(
					[ ...new Set( [ ...result.task_ids, ...patternTaskIdsForGoal( answers.goal ) ] ) ],
					composed,
					trimmedName
				);
			} )
			.catch( ( error ) => {
				window.console?.warn?.( '[Launchpad] tailor_and_draft (wizard) failed:', error );
				// Dolly failed → fall back to the raw description as tagline so
				// the site still gets one. Not ideal (could be long/awkward) but
				// better than an empty tagline.
				if ( siteId !== null && trimmedIntent !== '' ) {
					dispatch(
						saveSiteSettings( siteId, { blogdescription: trimmedIntent.slice( 0, 100 ) } )
					);
				}
				// Tailoring failed → the dashboard renders the deterministic
				// goal-based list, which still includes goal-tagged pattern tasks
				// (gallery / events). Pre-warm those so their copy + images are
				// ready even though Dolly's tailoring response was unusable.
				prewarmPatternPages( patternTaskIdsForGoal( answers.goal ), composed, trimmedName );
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

	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const siteState = useSiteState( siteSlug );
	const [ isPreviewOpen, setIsPreviewOpen ] = useState( false );

	useBodyClass( 'is-home-wizard-open', isWizardOpen );

	const handleWizardComplete = ( answers: WizardAnswers ) => {
		// Push the wizard's site name to Site Settings immediately so it persists
		// site-wide. The tagline (blogdescription) is written later by the Dolly
		// path inside useTailoredFlow — Dolly drafts a polished short version
		// from the user's raw description, with the raw text as a fallback if
		// Dolly returns no tagline or fails.
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
				<div className="home-dashboard__main">
					<SiteSetupWidget isTailoring={ isTailoring } />
				</div>
			) }
			{ isWizardOpen && (
				<HomeWizard
					initialSiteName={ currentSiteName }
					onClose={ () => finishWizard() }
					onComplete={ handleWizardComplete }
					onPrewarm={ prewarm }
				/>
			) }
			{ isPreviewOpen && (
				<TaskRegistryPreview siteState={ siteState } onClose={ () => setIsPreviewOpen( false ) } />
			) }
			{ ! isWizardOpen && (
				<Dropdown
					className="home-dashboard__wizard-fab-dropdown"
					popoverProps={ { placement: 'top-end', offset: 8 } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<button
							type="button"
							className="home-dashboard__wizard-fab"
							onClick={ onToggle }
							aria-expanded={ isOpen }
							aria-haspopup="menu"
							aria-label={ translate( 'Open Launchpad menu' ) as string }
						>
							<Icon icon={ settings } size={ 20 } />
							<span>{ translate( 'Launchpad' ) }</span>
						</button>
					) }
					renderContent={ ( { onClose } ) => (
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									onClose();
									openWizard();
								} }
							>
								{ translate( 'Run wizard' ) }
							</MenuItem>
							<MenuItem
								onClick={ () => {
									onClose();
									setIsPreviewOpen( true );
								} }
							>
								{ translate( 'Preview all tasks' ) }
							</MenuItem>
						</MenuGroup>
					) }
				/>
			) }
		</div>
	);
}
