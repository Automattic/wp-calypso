import { EventEmitter } from 'events';
import {
	recordTracksEvent as baseRecordTracksEvent,
	analyticsEvents,
	recordTracksPageView as baseRecordTracksPageView,
} from '@automattic/calypso-analytics';

export const tracksEvents = new EventEmitter();

export function recordTracksEvent( eventName, eventProperties ) {
	analyticsEvents.once( 'record-event', ( _eventName, _eventProperties ) => {
		tracksEvents.emit( 'record-event', _eventName, _eventProperties );
	} );

	baseRecordTracksEvent( eventName, eventProperties );
}

export function recordTracksPageView( urlPath, params ) {
	baseRecordTracksPageView( urlPath, params );
}
