import {
	MINIMIZED_BAR_HEIGHT,
	STACK_GAP,
	CSS_VAR_HC_BOTTOM_OFFSET,
	CSS_VAR_RAIL_INSET,
} from './constants';
import type { SurfaceSnapshot } from './reconciler';

export type LayoutVars = Record< string, string >;

/**
 * Agents Manager's "Ask AI" minimized bar sits in the bottom-right corner only
 * while AM is open *and* minimized (not docked). When fully hidden (not open)
 * nothing is shown there, and when expanded the panel — not a bar — is shown.
 * While that bar owns the corner, Help Center must sit above it.
 */
const amBarPresent = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	s.agentsManager.minimized &&
	! s.agentsManager.docked;

export function computeLayoutVars( s: SurfaceSnapshot ): LayoutVars {
	return {
		[ CSS_VAR_HC_BOTTOM_OFFSET ]: amBarPresent( s )
			? `${ MINIMIZED_BAR_HEIGHT + STACK_GAP }px`
			: '0px',
		[ CSS_VAR_RAIL_INSET ]: s.agentsManager.docked ? 'var(--am-sidebar-width, 350px)' : '0px',
	};
}
