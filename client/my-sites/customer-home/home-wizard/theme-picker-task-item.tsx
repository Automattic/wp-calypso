/**
 * Call to action for the "Choose a theme" task. Shows a single "Browse
 * themes" button; clicking opens a modal with 6 themes scored against
 * the wizard's `inferred` context (vibe / niche / goal).
 *
 * Matching is **fully client-side** — Dolly already extracted `inferred`
 * during the wizard call. The picker just consumes that understanding via
 * token overlap against the curated allowlist. Zero new latency, no
 * second Dolly round-trip.
 *
 * One-click activate dispatches the wpcom theme-activation action, then
 * routes the user into the site editor with the new theme ready to
 * customize.
 */
import page from '@automattic/calypso-router';
import { MShotsImage } from '@automattic/onboarding';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { Button, Dialog, Text } from '@wordpress/ui';
import { addQueryArgs } from '@wordpress/url';
import QueryTheme from 'calypso/components/data/query-theme';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { activateTheme } from 'calypso/state/themes/actions';
import { getActiveTheme, getTheme, isThemeAllowedOnSite } from 'calypso/state/themes/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recommendThemes } from './recommend-themes';
import { THEME_ALLOWLIST } from './theme-allowlist';
import { HOME_WIZARD_STATE_PREF, type HomeWizardState } from './wizard-state';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

type Props = {
	task: SelectedTask;
};

// Use MShotsImage rather than a live iframe preview. mshots returns a
// server-rendered static screenshot of the URL at the requested viewport,
// which sidesteps all the iframe layout/transform-scale headaches:
//   - no scale math, no banner-crop arithmetic
//   - no variable-height issue when a demo page runs out of content
//   - no cross-origin iframe quirks
//   - it's a plain <img> so object-fit gives us reliable cropping
// vpw/vph = the virtual viewport the screenshot is taken at (matches the
// wp.com theme demos' desktop layout); w = the delivered image width
// (2× the typical card width for sharpness on hi-DPI screens).
const MSHOTS_OPTIONS = { vpw: 1200, vph: 800, w: 800 } as const;
// Same flags SitePreview used to add to iframe URLs — strip the wp.com
// theme-demo promo banner + admin chrome so the rendered shot is clean.
function buildPreviewUrl( previewUrl: string ): string {
	return `${ previewUrl }?hide_banners=true&preview=true&iframe=true`;
}

// Mirror of @automattic/onboarding's internal `mshotsUrl()` — not re-exported
// from the package index, so we recreate it locally for the prefetch hook.
// Used only for the `new Image().src = …` warmup; MShotsImage itself builds
// the same URL internally when rendering.
function buildMshotsUrl( targetUrl: string ): string {
	return addQueryArgs( `https://s0.wp.com/mshots/v1/${ encodeURIComponent( targetUrl ) }`, {
		...MSHOTS_OPTIONS,
		count: 0,
	} );
}

function ThemePreview( { previewUrl, themeName }: { previewUrl: string; themeName: string } ) {
	return (
		<div className="theme-picker__preview">
			<MShotsImage
				url={ buildPreviewUrl( previewUrl ) }
				alt={ `${ themeName } theme preview` }
				aria-labelledby=""
				options={ MSHOTS_OPTIONS }
				loading="lazy"
			/>
		</div>
	);
}

export default function ThemePickerTaskItem( { task }: Props ) {
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const siteId = site?.ID ?? null;
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	// Use the site's display name in the dialog title to ground "picked for you"
	// in the specific site context. Falls back to a generic phrasing if the
	// site name is unavailable (rare — site is loaded by the time the dialog
	// can be opened).
	const siteName = ( site?.name ?? '' ).trim();
	const dialogTitle = siteName ? `Themes picked for ${ siteName }` : 'Themes picked for your site';
	// Select `inferred` directly (not the whole wizard state) so React only
	// re-renders us when inferred actually changes. Selecting the parent
	// object made useSelector trigger on unrelated changes (taskIds writes
	// etc.) AND occasionally returned a stale snapshot when sub-fields
	// updated — even with reference-changing spreads upstream.
	const inferred = useSelector( ( state: AppState ) => {
		const ws = getPreference( state, HOME_WIZARD_STATE_PREF ) as HomeWizardState | null;
		return ws?.inferred ?? null;
	} );
	// Suppress the currently-active theme — recommending what the user
	// already has running is noise, and it makes the picker feel less smart.
	const activeThemeSlug = useSelector( ( state: AppState ) =>
		getActiveTheme( state, siteId ?? undefined )
	);

	const [ isModalOpen, setIsModalOpen ] = useState< boolean >( false );
	const [ activatingSlug, setActivatingSlug ] = useState< string | null >( null );
	// The theme successfully activated during THIS modal session. Its card swaps
	// its CTA to "Edit site" and a confirmation banner appears; the user can then
	// edit or close and keep working through the Launchpad (no auto-navigate).
	const [ activatedSlug, setActivatedSlug ] = useState< string | null >( null );
	// The theme whose activation FAILED (e.g. needs a plan upgrade). Surfaces an
	// inline error instead of a false "activated" banner.
	const [ failedSlug, setFailedSlug ] = useState< string | null >( null );

	// Score the WHOLE allowlist (cheap — 12 themes × few tokens, sub-ms), so we
	// have spares to fall back on after filtering out themes the user's plan
	// can't activate. Slicing to the visible 6 happens after that filter.
	const scoredAll = recommendThemes( inferred ?? {}, THEME_ALLOWLIST.length, {
		excludeSlugs: activeThemeSlug ? [ activeThemeSlug ] : [],
	} );

	// Only offer themes the user can actually activate on their current plan
	// (free plan → free themes only). Strict: a theme is eligible ONLY when
	// (a) its metadata has loaded — `getTheme` returns a populated object once
	// the QueryTheme below resolves, otherwise undefined — AND (b) the tier
	// matches the site's plan features. The strict check is essential: with
	// the lenient default (`isThemeAllowedOnSite` alone) themes whose tier
	// hadn't loaded yet showed up as "allowed" and the user could click into
	// a premium pick that then failed to activate (testing 2026-05-29). The
	// returned key is a stable comma-joined string so useSelector doesn't
	// re-fire on unrelated state changes.
	const allowedKey = useSelector( ( state: AppState ) =>
		THEME_ALLOWLIST.map( ( t ) => t.slug )
			.filter( ( slug ) => {
				const theme = getTheme( state, 'wpcom', slug );
				if ( ! theme ) {
					return false;
				}
				return isThemeAllowedOnSite( state, siteId, slug );
			} )
			.join( ',' )
	);
	const allowedSet = useMemo(
		() => new Set( allowedKey ? allowedKey.split( ',' ) : [] ),
		[ allowedKey ]
	);

	// Freeze the SCORED list while the modal is open. recommendThemes() excludes
	// the active theme, so the instant a pick activates it would drop out of the
	// grid — leaving nowhere to show the "activated → Edit site" state. Freezing
	// the scored order on open keeps the activated card in place; the plan
	// filter below is applied at display time (so it can still settle as tiers
	// load).
	const [ frozenScored, setFrozenScored ] = useState< typeof scoredAll >( [] );
	const baseScored = frozenScored.length ? frozenScored : scoredAll;
	// Show the top 6 the plan allows. The just-activated theme is always kept,
	// even if its tier check is momentarily false, so its card never vanishes.
	const displayRecos = baseScored
		.filter( ( r ) => allowedSet.has( r.theme.slug ) || r.theme.slug === activatedSlug )
		.slice( 0, 6 );

	// Prefetch the mshots screenshots as soon as the picker mounts (i.e.,
	// when the user expands the pick-theme task) so they're warming in the
	// browser cache by the time the user clicks "Browse themes". mshots
	// first-time generation can take ~10s per URL; cached requests are
	// near-instant. Without this, every modal-open was a cold-start spinner.
	// Stable dep on the slug list (not the recommendations array, which is
	// a fresh reference every render).
	const prefetchKey = scoredAll
		.slice( 0, 6 )
		.map( ( r ) => r.theme.slug )
		.join( ',' );
	useEffect( () => {
		scoredAll.slice( 0, 6 ).forEach( ( { theme } ) => {
			const img = new Image();
			img.src = buildMshotsUrl( buildPreviewUrl( theme.previewUrl ) );
		} );
		// scoredAll intentionally excluded from deps — prefetchKey already
		// encodes its identity, and including it would re-fire every render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ prefetchKey ] );

	const handleOpenChange = ( open: boolean ) => {
		setIsModalOpen( open );
		if ( open ) {
			// Freeze the scored order for this session + reset any prior activation.
			setFrozenScored( scoredAll );
			setActivatedSlug( null );
			setFailedSlug( null );
		}
	};

	const onActivate = async ( slug: string ) => {
		if ( ! siteId || activatingSlug ) {
			return;
		}
		setActivatingSlug( slug );
		setFailedSlug( null );
		try {
			// activateTheme swallows failures: its .catch dispatches an error
			// notice but RESOLVES (doesn't reject), returning the stylesheet on
			// success and undefined on failure. So we can't rely on try/catch —
			// we check the resolved value to tell success from failure.
			const stylesheet = await dispatch(
				// Suppress activateTheme's built-in "View site" notice — we show our
				// own below with an "Edit design" action into the Site Editor.
				activateTheme( slug, siteId, {
					source: 'home-launchpad-ai',
					showSuccessNotice: false,
				} )
			);
			if ( stylesheet ) {
				// Activate in place — DON'T navigate away. The card swaps its CTA
				// to "Edit site" and a confirmation banner appears, so the user
				// can jump into the editor or close and keep working the
				// Launchpad. The theme is already changed either way.
				setActivatedSlug( slug );
				// Success snackbar with an "Edit design" action → Site Editor
				// (replaces activateTheme's default "View site").
				const themeName =
					baseScored.find( ( r ) => r.theme.slug === slug )?.theme.name ?? 'Your theme';
				dispatch(
					successNotice( `The ${ themeName } theme is activated successfully!`, {
						button: 'Edit design',
						href: `/site-editor/${ siteSlug }`,
						duration: 20000,
						showDismiss: true,
					} )
				);
				// Persist the pick so the dashboard marks the pick-theme task
				// complete. Read-modify-write the combined wizard-state pref so we
				// don't clobber the rest of it (goal, draft, taskIds…).
				dispatch( ( innerDispatch, getState ) => {
					const current =
						( getPreference( getState(), HOME_WIZARD_STATE_PREF ) as HomeWizardState | null ) ?? {};
					innerDispatch(
						savePreference( HOME_WIZARD_STATE_PREF, {
							...current,
							pickedThemeSlug: slug,
							pickedThemeSiteId: siteId,
						} )
					);
				} );
			} else {
				// Activation failed (e.g. needs a plan upgrade). activateTheme
				// already showed the error notice; surface an inline hint too.
				setFailedSlug( slug );
			}
		} catch ( error ) {
			window.console?.warn?.( '[Launchpad] activateTheme failed:', error );
			setFailedSlug( slug );
		} finally {
			setActivatingSlug( null );
		}
	};

	const activatedName = activatedSlug
		? displayRecos.find( ( r ) => r.theme.slug === activatedSlug )?.theme.name ?? null
		: null;
	const failedName = failedSlug
		? displayRecos.find( ( r ) => r.theme.slug === failedSlug )?.theme.name ?? null
		: null;

	return (
		<Dialog.Root open={ isModalOpen } onOpenChange={ handleOpenChange }>
			{ /* Load each allowlist theme's tier from the `wpcom` source (where
			   getThemeTierForTheme reads it), so we know which the user's plan can
			   activate (filtered in `displayRecos`). Mounted with the task so tiers
			   are ready before the modal opens. QueryTheme renders nothing. */ }
			{ THEME_ALLOWLIST.map( ( t ) => (
				<QueryTheme key={ t.slug } siteId="wpcom" themeId={ t.slug } />
			) ) }
			<Dialog.Trigger
				render={
					<Button variant="solid" tone="brand">
						Browse themes
					</Button>
				}
			/>
			<Dialog.Popup size="large" className="theme-picker__dialog">
				<Dialog.Header>
					<Dialog.Title>{ dialogTitle }</Dialog.Title>
					<Dialog.CloseIcon />
				</Dialog.Header>
				<div className="theme-picker">
					{ activatedName && (
						<div className="theme-picker__activated" role="status">
							<Text className="theme-picker__activated-text">
								<strong>{ activatedName }</strong> is now your active theme. Edit your site to
								customize it, or close and keep setting up.
							</Text>
						</div>
					) }
					{ failedName && (
						<div className="theme-picker__failed" role="alert">
							<Text className="theme-picker__failed-text">
								Couldn't activate <strong>{ failedName }</strong>. It may require a plan upgrade —
								try another theme, or check the notification for details.
							</Text>
						</div>
					) }
					<div className="theme-picker__grid">
						{ displayRecos.map( ( { theme, why } ) => {
							const isActivating = activatingSlug === theme.slug;
							const isActivated = activatedSlug === theme.slug;
							const otherActivating = !! activatingSlug && ! isActivating;
							return (
								<div key={ theme.slug } className="theme-picker__card">
									<ThemePreview previewUrl={ theme.previewUrl } themeName={ theme.name } />
									<div className="theme-picker__meta">
										<Text variant="heading-sm" className="theme-picker__name">
											{ theme.name }
										</Text>
										<Text variant="body-sm" className="theme-picker__why">
											{ why }
										</Text>
									</div>
									{ isActivated ? (
										<Button
											variant="solid"
											tone="brand"
											onClick={ () => page( `/site-editor/${ siteSlug }` ) }
										>
											Edit site
										</Button>
									) : (
										<Button
											variant={ activatedSlug ? 'outline' : 'solid' }
											tone="brand"
											loading={ isActivating }
											disabled={ otherActivating }
											onClick={ () => onActivate( theme.slug ) }
										>
											{ isActivating ? 'Activating…' : 'Use this theme' }
										</Button>
									) }
								</div>
							);
						} ) }
					</div>
				</div>
				<Dialog.Footer>
					<Button variant="minimal" tone="neutral" onClick={ () => page( task.resolvedUrl ) }>
						Browse all themes
					</Button>
					<Dialog.Action
						render={
							<Button variant="solid" tone="neutral">
								Close
							</Button>
						}
					/>
				</Dialog.Footer>
			</Dialog.Popup>
		</Dialog.Root>
	);
}
