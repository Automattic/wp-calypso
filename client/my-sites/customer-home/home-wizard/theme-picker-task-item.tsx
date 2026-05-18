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
import { useEffect, useState } from '@wordpress/element';
import { Button, Dialog, Text } from '@wordpress/ui';
import { addQueryArgs } from '@wordpress/url';
import { useDispatch, useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import { activateTheme } from 'calypso/state/themes/actions';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recommendThemes } from './recommend-themes';
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

	// Score every render — it's cheap (12 themes × few tokens, sub-ms).
	// useMemo was caching across re-renders that should have invalidated,
	// rendering stale picks. Recomputing fixes the correctness issue at
	// zero observable cost.
	const recommendations = recommendThemes( inferred ?? {}, 6, {
		excludeSlugs: activeThemeSlug ? [ activeThemeSlug ] : [],
	} );

	// Prefetch the mshots screenshots as soon as the picker mounts (i.e.,
	// when the user expands the pick-theme task) so they're warming in the
	// browser cache by the time the user clicks "Browse themes". mshots
	// first-time generation can take ~10s per URL; cached requests are
	// near-instant. Without this, every modal-open was a cold-start spinner.
	// Stable dep on the slug list (not the recommendations array, which is
	// a fresh reference every render).
	const prefetchKey = recommendations.map( ( r ) => r.theme.slug ).join( ',' );
	useEffect( () => {
		recommendations.forEach( ( { theme } ) => {
			const img = new Image();
			img.src = buildMshotsUrl( buildPreviewUrl( theme.previewUrl ) );
		} );
		// recommendations intentionally excluded from deps — prefetchKey
		// already encodes its identity, and including it would re-fire the
		// prefetch on every render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ prefetchKey ] );

	const onActivate = async ( slug: string ) => {
		if ( ! siteId || activatingSlug ) {
			return;
		}
		setActivatingSlug( slug );
		try {
			await dispatch(
				activateTheme( slug, siteId, {
					source: 'home-launchpad-ai',
					showSuccessNotice: true,
				} )
			);
			// Drop the user into the site editor with the new theme active —
			// same destination as the "Design your homepage" task, so the
			// rest of the Launchpad flow stays coherent.
			page( `/site-editor/${ siteSlug }` );
		} catch ( error ) {
			window.console?.warn?.( '[Launchpad] activateTheme failed:', error );
			setActivatingSlug( null );
		}
	};

	return (
		<Dialog.Root open={ isModalOpen } onOpenChange={ setIsModalOpen }>
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
					<div className="theme-picker__grid">
						{ recommendations.map( ( { theme, why } ) => {
							const isActivating = activatingSlug === theme.slug;
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
									<Button
										variant="solid"
										tone="brand"
										loading={ isActivating }
										disabled={ otherActivating }
										onClick={ () => onActivate( theme.slug ) }
									>
										{ isActivating ? 'Activating…' : 'Use this theme' }
									</Button>
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
