import {
	MINIMIZED_BAR_HEIGHT,
	STACK_GAP,
	CSS_VAR_HC_STACK_BOTTOM,
	CSS_VAR_AM_STACK_BOTTOM,
	CSS_VAR_RAIL_INSET,
} from './constants';
import type { Surface, SurfaceSnapshot } from './reconciler';

export type LayoutVars = Record< string, string >;

const hcBarVisible = ( s: SurfaceSnapshot ) =>
	s.helpCenter.present && s.helpCenter.shown && s.helpCenter.minimized;

const amBarVisible = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	s.agentsManager.minimized &&
	! s.agentsManager.docked;

export function computeLayoutVars( s: SurfaceSnapshot, lastExpanded: Surface | null ): LayoutVars {
	const raised = `${ MINIMIZED_BAR_HEIGHT + STACK_GAP }px`;
	const bothMinimized = hcBarVisible( s ) && amBarVisible( s );

	let hcBottom = '0px';
	let amBottom = '0px';
	if ( bothMinimized ) {
		// Most-recently-active bar sits on the bottom (slot 0); the other is raised.
		const amOnBottom = lastExpanded === 'agents-manager';
		hcBottom = amOnBottom ? raised : '0px';
		amBottom = amOnBottom ? '0px' : raised;
	}

	return {
		[ CSS_VAR_HC_STACK_BOTTOM ]: hcBottom,
		[ CSS_VAR_AM_STACK_BOTTOM ]: amBottom,
		[ CSS_VAR_RAIL_INSET ]: s.agentsManager.docked ? 'var(--am-sidebar-width, 350px)' : '0px',
	};
}
