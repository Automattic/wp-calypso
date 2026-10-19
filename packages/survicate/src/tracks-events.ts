import { analyticsEvents } from '@automattic/calypso-analytics';
import debug from './debug';
import { invokeSurvicateEvent, invokeSurvicateEventAfterModalsClose } from './invoke-event';

export type TracksEventForwarding = {
	/**
	 * Wait for open modals to close instead of dropping the event. For events
	 * recorded while the action's confirmation modal is still mounted.
	 */
	afterModalsClose?: boolean;
};

/**
 * Tracks events forwarded to Survicate under the same name, so a survey can
 * use them as its "When" trigger.
 *
 * Only list events recorded once the action has succeeded — most `*_click`
 * events fire before it does, which is too early for a survey. Never list a
 * `calypso_survicate_*` event: a suppressed invoke records one, so it would
 * forward itself.
 */
export const SURVICATE_TRACKS_EVENTS: Record< string, TracksEventForwarding > = {
	calypso_scheduled_updates_create_schedule: {},
};

/**
 * Forwards the allowlisted Tracks events to Survicate as they are recorded.
 * Only the event name is sent, never its properties.
 *
 * A burst of the same event (e.g. one per site in a bulk action) is invoked
 * once, and a new occurrence cancels one still waiting on the SDK or a modal.
 * @returns A cleanup function that stops forwarding and cancels pending invokes.
 */
export function forwardTracksEventsToSurvicate(
	events: Record< string, TracksEventForwarding > = SURVICATE_TRACKS_EVENTS
): () => void {
	const pending = new Map< string, () => void >();

	const onRecordEvent = ( eventName: string ) => {
		if ( ! Object.prototype.hasOwnProperty.call( events, eventName ) ) {
			return;
		}

		debug( 'Forwarding Tracks event "%s" to Survicate', eventName );
		pending.get( eventName )?.();

		const timeout = setTimeout( () => {
			pending.set(
				eventName,
				events[ eventName ].afterModalsClose
					? invokeSurvicateEventAfterModalsClose( eventName )
					: invokeSurvicateEvent( eventName )
			);
		} );
		pending.set( eventName, () => clearTimeout( timeout ) );
	};

	analyticsEvents.on( 'record-event', onRecordEvent );

	return () => {
		analyticsEvents.off( 'record-event', onRecordEvent );
		pending.forEach( ( cancel ) => cancel() );
		pending.clear();
	};
}
