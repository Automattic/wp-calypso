import debug from './debug';
import type { SuppressionReason } from './track-suppression';

/**
 * A consumer-provided reason to keep surveys off screen, for UI this package
 * can't detect on its own (e.g. the wp-admin notifications panel, which is
 * toggled with a class rather than mounted as a modal).
 */
export interface SurveySuppressor {
	reason: SuppressionReason;
	/** Whether surveys should be suppressed right now. */
	isActive: () => boolean;
	/** Calls `onChange` whenever `isActive()` may have changed; returns an unsubscribe. */
	subscribe: ( onChange: () => void ) => () => void;
}

const suppressors = new Set< SurveySuppressor >();
const registryListeners = new Set< () => void >();

function isActive( suppressor: SurveySuppressor ): boolean {
	try {
		return !! suppressor.isActive();
	} catch {
		return false;
	}
}

/**
 * Registers a suppressor so surveys are suppressed, and targeting paused,
 * while it is active — the same handling the Help Center gets.
 * @returns A function that unregisters it.
 */
export function registerSurveySuppressor( suppressor: SurveySuppressor ): () => void {
	suppressors.add( suppressor );
	registryListeners.forEach( ( fn ) => fn() );

	return () => {
		suppressors.delete( suppressor );
		registryListeners.forEach( ( fn ) => fn() );
	};
}

/**
 * The reason of the first active registered suppressor, or `null`. Fails open:
 * a suppressor that throws counts as inactive.
 */
export function getActiveSuppressorReason(): SuppressionReason | null {
	for ( const suppressor of suppressors ) {
		if ( isActive( suppressor ) ) {
			return suppressor.reason;
		}
	}
	return null;
}

/**
 * Watches every registered suppressor, including ones registered later, and
 * reports transitions: `onActivate` when one becomes active, `onDeactivate`
 * when one stops being active. Callers decide whether surveys can resume, since
 * another suppressor (or a modal) may still be active.
 * @returns A cleanup function that unsubscribes from all suppressors.
 */
export function observeSuppressors(
	onActivate: ( reason: SuppressionReason ) => void,
	onDeactivate: () => void
): () => void {
	const watched = new Map< SurveySuppressor, () => void >();

	const watch = ( suppressor: SurveySuppressor ) => {
		let wasActive = isActive( suppressor );
		try {
			const unsubscribe = suppressor.subscribe( () => {
				const active = isActive( suppressor );
				if ( active === wasActive ) {
					return;
				}
				wasActive = active;
				if ( active ) {
					debug( 'Suppressor "%s" became active', suppressor.reason );
					onActivate( suppressor.reason );
				} else {
					debug( 'Suppressor "%s" became inactive', suppressor.reason );
					onDeactivate();
				}
			} );
			watched.set( suppressor, unsubscribe );
		} catch {
			// A suppressor that can't be observed is still checked at display time.
		}
	};

	const sync = () => {
		for ( const [ suppressor, unsubscribe ] of watched ) {
			if ( ! suppressors.has( suppressor ) ) {
				unsubscribe();
				watched.delete( suppressor );
			}
		}
		for ( const suppressor of suppressors ) {
			if ( ! watched.has( suppressor ) ) {
				watch( suppressor );
			}
		}
	};

	sync();
	registryListeners.add( sync );

	return () => {
		registryListeners.delete( sync );
		watched.forEach( ( unsubscribe ) => unsubscribe() );
		watched.clear();
	};
}
