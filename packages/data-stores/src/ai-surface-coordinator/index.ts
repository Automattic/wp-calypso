import { select, dispatch, subscribe } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { STORE_KEY as AM_KEY } from '../agents-manager/constants';
import { STORE_KEY as HC_KEY } from '../help-center/constants';
import { LAST_EXPANDED_STORAGE_KEY } from './constants';
import { computeLayoutVars } from './layout';
import { computeCoordination, type Surface, type SurfaceSnapshot } from './reconciler';
import type {
	AgentsManagerSelect,
	Dispatch as AgentsManagerDispatch,
} from '../agents-manager/types';
import type { HelpCenterSelect, Dispatch as HelpCenterDispatch } from '../help-center/types';

export * from './reconciler';
export * from './layout';
export * from './constants';

function readSnapshot(): SurfaceSnapshot {
	const hc = select( HC_KEY ) as unknown as HelpCenterSelect | undefined;
	const am = select( AM_KEY ) as unknown as AgentsManagerSelect | undefined;

	return {
		helpCenter: {
			present: !! hc,
			shown: !! hc?.isHelpCenterShown(),
			minimized: !! hc?.getIsMinimized(),
		},
		agentsManager: {
			present: !! am,
			open: !! am?.getIsOpen(),
			minimized: !! am?.getIsMinimized(),
			docked: !! am?.getIsDocked(),
		},
	};
}

function readLastExpanded(): Surface | null {
	try {
		const v = window.localStorage.getItem( LAST_EXPANDED_STORAGE_KEY );
		return v === 'help-center' || v === 'agents-manager' ? v : null;
	} catch {
		return null;
	}
}

function writeLastExpanded( surface: Surface | null ) {
	if ( surface ) {
		try {
			window.localStorage.setItem( LAST_EXPANDED_STORAGE_KEY, surface );
		} catch {
			// Non-critical UI hint; ignore storage failures (e.g. Safari private mode).
		}
	}
}

function applyLayoutVars( vars: Record< string, string > ) {
	const root = document.documentElement;
	for ( const [ name, value ] of Object.entries( vars ) ) {
		root.style.setProperty( name, value );
	}
}

/**
 * Runtime coordinator that keeps at most one AI surface floating-expanded.
 * Mount once per page (Calypso layout, each widget entry). Pass `enabled=false`
 * to fully disable (flag off) — it then performs no subscription and no writes.
 */
export function useAiSurfaceCoordinator( enabled: boolean ) {
	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		let prev = readSnapshot();
		let lastExpanded = readLastExpanded();
		let reconciling = false;

		const reconcile = () => {
			if ( reconciling ) {
				return;
			}
			const next = readSnapshot();
			const { commands, lastExpanded: nextLast } = computeCoordination( prev, next, lastExpanded );

			if ( nextLast !== lastExpanded ) {
				lastExpanded = nextLast;
				writeLastExpanded( lastExpanded );
			}

			// Snapshot prev BEFORE dispatching so re-entrant calls see a consistent baseline.
			prev = next;

			reconciling = true;
			try {
				for ( const command of commands ) {
					if ( command.surface === 'agents-manager' ) {
						// Agents Manager "parks" by closing its panel back to the
						// persistent "Ask AI" bar — not via isMinimized (which is a
						// wp-admin-only concept). setIsOpen( false ) is its real close.
						( dispatch( AM_KEY ) as AgentsManagerDispatch ).setIsOpen( false );
					} else {
						( dispatch( HC_KEY ) as HelpCenterDispatch[ 'dispatch' ] ).setIsMinimized( true );
					}
				}
			} finally {
				reconciling = false;
			}

			// After commands ran, bring prev in sync with the actual store state so
			// subsequent ticks correctly detect new transitions (e.g. a surface
			// re-expanding after having been minimized by a command above).
			if ( commands.length > 0 ) {
				prev = readSnapshot();
			}

			applyLayoutVars( computeLayoutVars( next ) );
		};

		reconcile(); // boot reconciliation
		const unsubscribe = subscribe( reconcile );
		return unsubscribe;
	}, [ enabled ] );
}
