import { EventEmitter } from 'events';
import {
	recordTracksEvent as baseRecordTracksEvent,
	recordTracksPageView as baseRecordTracksPageView,
	pushEventToTracksQueue,
} from '@automattic/calypso-analytics';

export const tracksEvents = new EventEmitter();

export function recordTracksEvent( eventName, eventProperties ) {
	baseRecordTracksEvent( eventName, eventProperties, ( _eventName, _eventProperties ) => {
		tracksEvents.emit( 'record-event', _eventName, _eventProperties );
	} );
}

export function recordTracksPageView( urlPath, params ) {
	baseRecordTracksPageView( urlPath, params );
}

export function setTracksOptOut( isOptingOut ) {
	pushEventToTracksQueue( [ 'setOptOut', isOptingOut ] );
}
