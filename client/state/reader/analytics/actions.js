/**
 * Internal dependencies
 */
import { READER_ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';

const recordEvent = ( service, args ) => ( {
	type: READER_ANALYTICS_EVENT_RECORD,
	meta: {
		analytics: [
			{
				type: READER_ANALYTICS_EVENT_RECORD,
				payload: Object.assign( {}, { service }, args ),
			},
		],
	},
} );

export const recordReaderTracksEvent = ( name, properties ) =>
	recordEvent( 'tracks', { name, properties } );
