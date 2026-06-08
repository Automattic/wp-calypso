import { select } from '@wordpress/data';
import { closeSurvicateSurvey } from './close-survey';
import debug from './debug';

const HELP_CENTER_STORE = 'automattic/help-center';

/**
 * Checks whether the Help Center is currently open by reading its
 * `@wordpress/data` store. Returns `false` if the store is not registered
 * (e.g. in contexts where the Help Center is not loaded).
 */
export function isHelpCenterOpen(): boolean {
	try {
		const store = select( HELP_CENTER_STORE ) as { isHelpCenterShown?: () => boolean } | undefined;
		return !! store?.isHelpCenterShown?.();
	} catch {
		return false;
	}
}

/**
 * Invokes a Survicate event by name.
 * If the SDK is already loaded, fires immediately. Otherwise waits for the
 * `SurvicateReady` window event before invoking.
 *
 * Events are suppressed while the Help Center is open.
 *
 * @returns A cleanup function that removes the event listener.
 */
export function invokeSurvicateEvent( eventName: string ): () => void {
	if ( isHelpCenterOpen() ) {
		debug( 'Survicate event "%s" suppressed (Help Center is open)', eventName );
		closeSurvicateSurvey();
		return () => {};
	}

	if ( typeof window._sva !== 'undefined' && window._sva.invokeEvent ) {
		window._sva.invokeEvent( eventName );
		return () => {};
	}

	const handler = () => {
		if ( isHelpCenterOpen() ) {
			debug( 'Deferred Survicate event "%s" suppressed at SurvicateReady time', eventName );
			return;
		}
		if ( typeof window._sva !== 'undefined' && window._sva.invokeEvent ) {
			window._sva.invokeEvent( eventName );
		}
	};

	window.addEventListener( 'SurvicateReady', handler, { once: true } );

	return () => {
		window.removeEventListener( 'SurvicateReady', handler );
	};
}
