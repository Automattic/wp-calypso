/**
 * Internal dependencies
 */
import { READER_ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';

export const recordEvent = ( service, args ) => ( {
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

export const recordTracksEvent = ( name, properties ) =>
	recordEvent( 'tracks', { name, properties } );
