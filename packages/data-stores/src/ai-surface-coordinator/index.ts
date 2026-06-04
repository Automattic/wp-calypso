import { select, dispatch, subscribe } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { STORE_KEY as AM_KEY } from '../agents-manager/constants';
import { STORE_KEY as HC_KEY } from '../help-center/constants';
import { LAST_EXPANDED_STORAGE_KEY } from './constants';
import { computeLayoutVars } from './layout';
import { computeCoordination, type Surface, type SurfaceSnapshot } from './reconciler';

export * from './reconciler';
export * from './layout';
export * from './constants';

function readSnapshot(): SurfaceSnapshot {
	const hc = select( HC_KEY ) as
		| { isHelpCenterShown: () => boolean; getIsMinimized: () => boolean }
		| undefined;
	const am = select( AM_KEY ) as
		| { getIsOpen: () => boolean; getIsMinimized: () => boolean; getIsDocked: () => boolean }
		| undefined;

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
	const v = window.localStorage.getItem( LAST_EXPANDED_STORAGE_KEY );
	return v === 'help-center' || v === 'agents-manager' ? v : null;
}

function writeLastExpanded( surface: Surface | null ) {
	if ( surface ) {
		window.localStorage.setItem( LAST_EXPANDED_STORAGE_KEY, surface );
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

		const reconcile = () => {
			const next = readSnapshot();
			const { commands, lastExpanded: nextLast } = computeCoordination( prev, next, lastExpanded );

			if ( nextLast !== lastExpanded ) {
				lastExpanded = nextLast;
				writeLastExpanded( lastExpanded );
			}

			for ( const command of commands ) {
				if ( command.surface === 'agents-manager' ) {
					( dispatch( AM_KEY ) as { setIsMinimized: ( v: boolean ) => void } ).setIsMinimized(
						true
					);
				} else {
					( dispatch( HC_KEY ) as { setIsMinimized: ( v: boolean ) => void } ).setIsMinimized(
						true
					);
				}
			}

			applyLayoutVars( computeLayoutVars( next, lastExpanded ) );
			prev = next;
		};

		reconcile(); // boot reconciliation
		const unsubscribe = subscribe( reconcile );
		return unsubscribe;
	}, [ enabled ] );
}
