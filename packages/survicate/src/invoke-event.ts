import { select } from '@wordpress/data';
import { closeSurvicateSurvey } from './close-survey';
import debug from './debug';
import { isModalOpen } from './modal-detection';
import { recordSurveySuppressed, type SuppressionReason } from './track-suppression';

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
 * Why surveys should currently be suppressed, or `null` if they shouldn't.
 * The Help Center (store-based check — more reliable than DOM for a
 * non-`aria-modal` panel) takes precedence over a generic modal, so `modal`
 * is reported only when it is the sole reason — which is exactly what measures
 * the incremental effect of the modal rule.
 */
export function getSuppressionReason(): SuppressionReason | null {
	if ( isHelpCenterOpen() ) {
		return 'help_center';
	}
	if ( isModalOpen() ) {
		return 'modal';
	}
	return null;
}

/**
 * Whether surveys should currently be suppressed: the Help Center is open
 * or some other modal dialog is on screen.
 */
export function shouldSuppressSurvey(): boolean {
	return getSuppressionReason() !== null;
}

/**
 * Invokes a Survicate event by name.
 * If the SDK is already loaded, fires immediately. Otherwise waits for the
 * `SurvicateReady` window event before invoking.
 *
 * Events are suppressed while the Help Center or another modal is open.
 *
 * @returns A cleanup function that removes the event listener.
 */
export function invokeSurvicateEvent( eventName: string ): () => void {
	const suppressionReason = getSuppressionReason();
	if ( suppressionReason ) {
		debug( 'Survicate event "%s" suppressed (Help Center or a modal is open)', eventName );
		recordSurveySuppressed( suppressionReason, 'invoke_event', { event_name: eventName } );
		closeSurvicateSurvey();
		return () => {};
	}

	if ( typeof window._sva !== 'undefined' && window._sva.invokeEvent ) {
		window._sva.invokeEvent( eventName );
		return () => {};
	}

	const handler = () => {
		const deferredReason = getSuppressionReason();
		if ( deferredReason ) {
			debug( 'Deferred Survicate event "%s" suppressed at SurvicateReady time', eventName );
			recordSurveySuppressed( deferredReason, 'invoke_event', { event_name: eventName } );
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
