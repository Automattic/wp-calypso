import {
	MINIMIZED_BAR_HEIGHT,
	STACK_GAP,
	CSS_VAR_HC_BOTTOM_OFFSET,
	CSS_VAR_AM_BOTTOM_OFFSET,
	CSS_VAR_RAIL_INSET,
} from './constants';
import type { SurfaceSnapshot } from './reconciler';

export type LayoutVars = Record< string, string >;

// Help Center's minimized bar sits in the bottom-right corner when shown + minimized.
const hcBarPresent = ( s: SurfaceSnapshot ) =>
	s.helpCenter.present && s.helpCenter.shown && s.helpCenter.minimized;

// Help Center's open card is shown when it's shown and not minimized.
const hcOpenCard = ( s: SurfaceSnapshot ) =>
	s.helpCenter.present && s.helpCenter.shown && ! s.helpCenter.minimized;

// Agents Manager's "Ask AI" minimized bar (open + minimized, undocked).
const amBarPresent = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	s.agentsManager.minimized &&
	! s.agentsManager.docked;

// Agents Manager's open floating panel (open, not minimized, undocked).
const amOpenPanel = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	! s.agentsManager.minimized &&
	! s.agentsManager.docked;

export function computeLayoutVars( s: SurfaceSnapshot ): LayoutVars {
	const raised = `${ MINIMIZED_BAR_HEIGHT + STACK_GAP }px`;

	// Whichever surface is OPEN lifts above the OTHER surface's minimized bar so
	// the open panel sits cleanly above it. (Both-minimized is handled by a
	// shared container, not these offsets.)
	const hcBottomOffset = amBarPresent( s ) && hcOpenCard( s ) ? raised : '0px';
	const amBottomOffset = hcBarPresent( s ) && amOpenPanel( s ) ? raised : '0px';

	return {
		[ CSS_VAR_HC_BOTTOM_OFFSET ]: hcBottomOffset,
		[ CSS_VAR_AM_BOTTOM_OFFSET ]: amBottomOffset,
		[ CSS_VAR_RAIL_INSET ]: s.agentsManager.docked ? 'var(--am-sidebar-width, 350px)' : '0px',
	};
}
