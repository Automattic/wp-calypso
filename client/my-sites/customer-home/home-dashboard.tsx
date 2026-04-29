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
import { useEffect, useRef, useState } from '@wordpress/element';
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
import { getSiteUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HomeWizard from './home-wizard';
import { selectTasks } from './home-wizard/select-tasks';
import TailoredLaunchpad from './home-wizard/tailored-launchpad';
import type { SiteState } from './home-wizard/task-registry';
import type { FeatureKey, GoalKey, WizardAnswers } from './home-wizard/types';
import type { AppState } from 'calypso/types';

import './home-dashboard.scss';

// Per-site list so each newly created site triggers the wizard once.
const HOME_WIZARD_COMPLETED_SITES_PREF = 'home_wizard_completed_sites';
const HOME_WIZARD_GOAL_PREF = 'home_wizard_goal';
const HOME_WIZARD_FEATURES_PREF = 'home_wizard_features';

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

function SiteSetupWidget() {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const site = useSelector( getSelectedSite );
	const wizardGoal = useSelector( ( state: AppState ) =>
		getPreference( state, HOME_WIZARD_GOAL_PREF )
	) as GoalKey | null;
	const wizardFeatures =
		( useSelector( ( state: AppState ) => getPreference( state, HOME_WIZARD_FEATURES_PREF ) ) as
			| FeatureKey[]
			| null ) ?? [];

	const siteIntent = ( site?.options as { site_intent?: string } | undefined )?.site_intent ?? '';
	const siteState = useSiteState( siteSlug );

	const tailoredTasks = wizardGoal ? selectTasks( wizardGoal, wizardFeatures, siteState ) : [];

	// Fallback path for users who skipped the wizard or whose preferences
	// haven't loaded yet — keep the original server-driven Launchpad.
	const fallbackChecklistSlug =
		siteIntent || ( wizardGoal ? GOAL_TO_CHECKLIST[ wizardGoal ] ?? 'build' : 'build' );
	const {
		data: { checklist: fallbackChecklist },
	} = useSortedLaunchpadTasks( siteSlug, fallbackChecklistSlug, LAUNCHPAD_CONTEXT );

	const useTailored = wizardGoal !== null && tailoredTasks.length > 0;
	const fallbackVisible = ! useTailored && ( fallbackChecklist?.length ?? 0 ) > 0;

	if ( ! useTailored && ! fallbackVisible ) {
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
				{ useTailored ? (
					<TailoredLaunchpad tasks={ tailoredTasks } />
				) : (
					<Launchpad
						siteSlug={ siteSlug }
						checklistSlug={ fallbackChecklistSlug }
						launchpadContext={ LAUNCHPAD_CONTEXT }
					/>
				) }
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

	const finish = ( answers?: WizardAnswers ) => {
		touched.current = true;
		setIsOpen( false );

		if ( siteId !== null ) {
			const next = Array.from( new Set( [ ...( completedSites ?? [] ), siteId ] ) );
			dispatch( savePreference( HOME_WIZARD_COMPLETED_SITES_PREF, next ) );
		}
		if ( answers?.goal ) {
			dispatch( savePreference( HOME_WIZARD_GOAL_PREF, answers.goal ) );
		}
		if ( answers?.features ) {
			dispatch( savePreference( HOME_WIZARD_FEATURES_PREF, answers.features ) );
		}
		if ( forced && typeof window !== 'undefined' ) {
			const url = new URL( window.location.href );
			url.searchParams.delete( 'wizard' );
			window.history.replaceState( null, '', url.toString() );
		}
	};

	return { isOpen, open, finish };
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
	const { isOpen: isWizardOpen, open: openWizard, finish: finishWizard } = useHomeWizard();

	useBodyClass( 'is-home-wizard-open', isWizardOpen );

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
							<SiteSetupWidget />
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
					onClose={ () => finishWizard() }
					onComplete={ ( answers ) => finishWizard( answers ) }
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
					<span>{ translate( 'Setup wizard' ) }</span>
				</button>
			) }
		</div>
	);
}
