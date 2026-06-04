export type Surface = 'help-center' | 'agents-manager';

export interface SurfaceSnapshot {
	helpCenter: { present: boolean; shown: boolean; minimized: boolean };
	agentsManager: { present: boolean; open: boolean; minimized: boolean; docked: boolean };
}

export type Command =
	| { type: 'minimize'; surface: 'help-center' }
	| { type: 'minimize'; surface: 'agents-manager' };

export interface CoordinationResult {
	commands: Command[];
	lastExpanded: Surface | null;
}

const isHelpCenterExpanded = ( s: SurfaceSnapshot ) =>
	s.helpCenter.present && s.helpCenter.shown && ! s.helpCenter.minimized;

// A docked Agents Manager lives in its own rail and never conflicts.
const isAgentsManagerFloatingExpanded = ( s: SurfaceSnapshot ) =>
	s.agentsManager.present &&
	s.agentsManager.open &&
	! s.agentsManager.minimized &&
	! s.agentsManager.docked;

export function computeCoordination(
	prev: SurfaceSnapshot,
	next: SurfaceSnapshot,
	lastExpanded: Surface | null
): CoordinationResult {
	const hcExpanded = isHelpCenterExpanded( next );
	const amExpanded = isAgentsManagerFloatingExpanded( next );

	// Single (or zero) floating-expanded surface: record it, nothing to minimize.
	if ( ! ( hcExpanded && amExpanded ) ) {
		let sole: Surface | null;
		if ( hcExpanded ) {
			sole = 'help-center';
		} else if ( amExpanded ) {
			sole = 'agents-manager';
		} else {
			sole = lastExpanded;
		}
		return { commands: [], lastExpanded: sole };
	}

	// Both floating-expanded → keep one, minimize the other.
	// Prefer the surface that just transitioned into expansion this tick.
	const hcJustExpanded = hcExpanded && ! isHelpCenterExpanded( prev );
	const amJustExpanded = amExpanded && ! isAgentsManagerFloatingExpanded( prev );

	let keep: Surface;
	if ( hcJustExpanded && ! amJustExpanded ) {
		keep = 'help-center';
	} else if ( amJustExpanded && ! hcJustExpanded ) {
		keep = 'agents-manager';
	} else {
		// No single transition (e.g. boot from persisted state, or both at once):
		// keep the most-recently-active; default to Agents Manager when unknown.
		keep = lastExpanded ?? 'agents-manager';
	}

	const loser: Surface = keep === 'help-center' ? 'agents-manager' : 'help-center';
	return { commands: [ { type: 'minimize', surface: loser } ], lastExpanded: keep };
}
