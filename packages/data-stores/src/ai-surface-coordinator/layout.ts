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

	// Help Center always sits above Agents Manager's bar when that bar is present.
	// When BOTH are minimized they form a single stacked container, so the bars
	// sit flush (no gutter); when Help Center is the open card it keeps the
	// gutter above the bar.
	let hcBottomOffset = '0px';
	if ( amBarPresent( s ) ) {
		hcBottomOffset = hcBarPresent( s ) ? `${ MINIMIZED_BAR_HEIGHT }px` : raised;
	}
	// Agents Manager's open panel lifts above Help Center's minimized bar. (When
	// AM is itself minimized, it stays at the bottom and Help Center lifts above
	// it via the offset above — so they never both lift.)
	const amBottomOffset = hcBarPresent( s ) && amOpenPanel( s ) ? raised : '0px';

	return {
		[ CSS_VAR_HC_BOTTOM_OFFSET ]: hcBottomOffset,
		[ CSS_VAR_AM_BOTTOM_OFFSET ]: amBottomOffset,
		[ CSS_VAR_RAIL_INSET ]: s.agentsManager.docked ? 'var(--am-sidebar-width, 350px)' : '0px',
	};
}
